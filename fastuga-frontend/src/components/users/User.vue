<script setup>
import { ref, watch, inject } from 'vue'
import UserDetail from "./UserDetail.vue"
import { useRouter, onBeforeRouteLeave } from 'vue-router'

import UserOrdersTable from './UserOrdersTable.vue'
import EmployeeStats from './EmployeeStats.vue'

import axiosForCreate from 'axios'
import { useUserStore } from '../../stores/user';

const router = useRouter()
const axios = inject('axios')
const toast = inject('toast')
const socket = inject('socket')

const userStore = useUserStore();

const paginationData = ref(null)
const paginationPage = ref(1)

const options = ref({
  hideCount: true,
  edgeNavigation: true
})

const props = defineProps({
  id: {
    type: Number,
    default: null
  }
})

const newUser = () => {
  return {
    id: null,
    name: '',
    email: '',
    photo_file: null,
    photo_url: null,
    type: '',
    blocked: null,
    phone: '',
    nif: '',
    points: null,
    default_payment_type: '',
    default_payment_reference: '',
    password: '',
  }
}

let originalValueStr = ''
const loadUser = (id) => {
  originalValueStr = ''
  errors.value = null
  if (!id || (id < 0)) {
    user.value = newUser()
  } else {
    axios.get('users/' + id)
      .then((response) => {
        user.value = response.data.data
        originalValueStr = dataAsString()
        if (user.value.type == 'C') {
          axios.get('customers/' + user.value.id)
            .then((response) => {
              user.value.phone = response.data.data.phone;
              user.value.nif = response.data.data.nif;
              user.value.points = response.data.data.points;
              user.value.default_payment_type = response.data.data.default_payment_type;
              user.value.default_payment_reference = response.data.data.default_payment_reference;
              originalValueStr = dataAsString()
              loadOrders()
            }).catch((error) => {
              console.log(error)
            })
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }
  originalValueStr = dataAsString()
}

const loadOrders = () => {
  axios.get('customers/' + user.value.id + '/orders?page=' + paginationPage.value)
    .then((response) => {
      orders.value = response.data.data
      paginationData.value = response.data.meta
    })
    .catch((error) => {
      toast.error("Error getting order history for customer")
    })
}

const save = () => {
  errors.value = null

  if (props.id != -1) {//editar user
    axios.put('users/' + props.id, user.value)
      .then((response) => {
        user.value = response.data.data
        socket.emit('updateUser', user.value)
        if (user.value.id == userStore.user.id) {
          userStore.user = user.value
        }
        originalValueStr = dataAsString()
        toast.success('User #' + user.value.id + ' was updated successfully.')
        loadUser(user.value.id)
      })
      .catch((error) => {
        console.log(error)
        if (error.response.status == 422) {
          toast.error('User #' + props.id + ' was not updated due to validation errors!')
          errors.value = error.response.data.errors
        } else {
          toast.error('User #' + props.id + ' was not updated due to unknown server error!')
        }
      })
    //falta pedido para guardar informaçoes de cliente depois de alteradas
  } else if (props.id == -1) {//criar user 
    var data = new FormData();

    data.append('name', user.value.name)
    data.append('email', user.value.email)
    data.append('password', user.value.password)
    data.append('photo_file', user.value.photo_file)
    if (user.value.photo_file == null) {
      data.delete('photo_file')
    }
    data.append('type', user.value.type != '' ? user.value.type : 'C')
    if (userStore.userId != -1 && user.value.type == '') {
      data.delete('type')
    }

    data.append('blocked', 0)
    if (user.value.type == '' && userStore.userId == -1) {
      data.append('phone', user.value.phone)
      data.append('nif', user.value.nif)
      data.append('points', 0)
      data.append('default_payment_reference', user.value.default_payment_reference)
      data.append('default_payment_type', user.value.default_payment_type)
    }

    axiosForCreate.post('http://fastugaserver.test/api/users/register', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((response) => {
      toast.success('User ' + user.value.name + ' registado com sucesso')
      if (userStore.user == null) {
        user.value = response.data.data;
        socket.emit('newUser', user.value)
        originalValueStr = dataAsString()
        //redirect para login
        router.push({ name: 'Login' })
      } else {
        user.value = response.data.data;
        socket.emit('newUser', user.value)
        originalValueStr = dataAsString()
        //redirect para Users
        router.push({ name: 'Users' })
      }
    })
      .catch((error) => {
        if (error.response.status == 422) {
          toast.error('User #' + props.id + ' was not updated due to validation errors!')
          errors.value = error.response.data.errors
        } else {
          toast.error('User #' + props.id + ' was not updated due to unknown server error!')
          errors.value = error.response.data.errors
        }
      })
  }
}


const cancel = () => {
  originalValueStr = dataAsString()
  router.back()
}

const dataAsString = () => {
  return JSON.stringify(user.value)
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
  console.log(originalValueStr)
  console.log(newValueStr)
  if (originalValueStr != newValueStr) {
    nextCallBack = next
    confirmationLeaveDialog.value.show()
  } else {
    next()
  }
})

const user = ref(newUser())
const errors = ref(null)
const confirmationLeaveDialog = ref(null)

const orders = ref([])

const orderHistory = ref(false)

watch(
  () => props.id,
  (newValue) => {
    loadUser(newValue)
  },
  { immediate: true }
)
</script>

<template>
  <confirmation-dialog ref="confirmationLeaveDialog" confirmationBtn="Discard changes and leave"
    msg="Do you really want to leave? You have unsaved changes!" @confirmed="leaveConfirmed">
  </confirmation-dialog>

  <user-detail :user="user" :errors="errors" @save="save" @cancel="cancel"></user-detail>
  <div v-if="user.id != null">
    <div v-if="user.type == 'C'">
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="checkbox" name="checkBoxOrders" value="show" required
          v-model="orderHistory" id="inputTypePaypal" />
        <label class="form-check-label" for="inputTypePaypal">Show Order History</label>
      </div>

      <user-orders-table v-if="orderHistory" :orders="orders"></user-orders-table>
      <Pagination v-if="orderHistory" v-model="paginationPage" :options="options"
        :records="paginationData ? paginationData.total : 0" :per-page="paginationData ? paginationData.per_page : 0"
        @paginate="loadOrders"></Pagination>
    </div>

    <div v-if="user.type == 'EC' || user.type == 'ED' || user.type == 'EM'">
      <EmployeeStats :user="user"></EmployeeStats>
    </div>
  </div>
</template>
