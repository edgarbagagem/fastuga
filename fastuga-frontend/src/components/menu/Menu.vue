<script setup>
import { ref, watch, inject } from 'vue'
import MenuDetails from "./MenuDetails.vue"
import { useRouter, onBeforeRouteLeave } from 'vue-router'

import axiosForm from 'axios'

const socket = inject('socket')
const router = useRouter()
const axios = inject('axios')
const toast = inject('toast')
const props = defineProps({
  id: {
    type: Number,
    default: null
  }
})

const newProduto = () => {
  return {
    id: null,
    name: '',
    type: '',
    description: '',
    photo_file: null,
    photo_url: null,
    price: null
  }
}

let originalValueStr = ''
const loadProduct = (id) => {
  originalValueStr = ''
  errors.value = null
  if (!id || (id < 0)) {
    produto.value = newProduto()
    originalValueStr = dataAsString()
  } else {
    axios.get('menu/' + id)
      .then((response) => {
        produto.value = response.data.data
        originalValueStr = dataAsString()
      })
      .catch((error) => {
        console.log(error)
      })
  }
}

const save = () => {
  errors.value = null
  if (props.id != -1) {
    axios.put('menu/' + props.id, produto.value)
      .then((response) => {
        produto.value = response.data.data
        socket.emit('updateMenu')
        originalValueStr = dataAsString()
        toast.success('Product #' + produto.value.id + ' was updated successfully.')
        loadProduct(produto.value.id)
      })
      .catch((error) => {
        if (error.response.status == 422) {
          toast.error('Product #' + props.id + ' was not updated due to validation errors!')
          errors.value = error.response.data.errors
        } else {
          toast.error('Product #' + props.id + ' was not updated due to unknown server error!')
        }
      })
  } else {
    const data = new FormData()
    data.append('name', produto.value.name)
    data.append('type', produto.value.type)
    data.append('description', produto.value.description)
    data.append('price', produto.value.price)
    data.append('photo_file', produto.value.photo_file)
    if (produto.value.photo_file == null) {
      data.delete('photo_file')
    }
    axiosForm.defaults.headers.common.Authorization = "Bearer " + sessionStorage.getItem('token')
    axiosForm.post('http://fastugaserver.test/api/menu/create', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
      .then((response) => {
        produto.value = response.data.data
        socket.emit('updateMenu')
        originalValueStr = dataAsString()
        toast.success("Produto created successfully")
        router.back()
      })
      .catch((error) => {
        console.log(error)
        if (error.response.status == 422) {
          toast.error('Product was not created due to validation errors!')
          errors.value = error.response.data.errors
        } else {
          toast.error('Product was not created due to unknown server error!')
        }
      })
  }
}

const cancel = () => {
  originalValueStr = dataAsString()
  router.back()
}

const dataAsString = () => {
  return JSON.stringify(produto.value)
}

let nextCallBack = null
const leaveConfirmed = () => {
  if (nextCallBack) {
    nextCallBack()
  }
}

onBeforeRouteLeave((to, from, next) => {
  nextCallBack = null
  let newValueStr = dataAsString()
  if (originalValueStr != newValueStr) {
    nextCallBack = next
    confirmationLeaveDialog.value.show()
  } else {
    next()
  }
})

const produto = ref(newProduto())
const errors = ref(null)
const confirmationLeaveDialog = ref(null)

watch(
  () => props.id,
  (newValue) => {
    loadProduct(newValue)
  },
  { immediate: true }
)

</script>
<template>
  <confirmation-dialog ref="confirmationLeaveDialog" confirmationBtn="Discard changes and leave"
    msg="Do you really want to leave? You have unsaved changes!" @confirmed="leaveConfirmed">
  </confirmation-dialog>
  <MenuDetails :produto="produto" :errors="errors" @save="save" @cancel="cancel">
  </MenuDetails>
</template>