<script setup>

import { ref, computed, onMounted, inject } from 'vue'

import MenuTable from "./MenuTable.vue"

import { useRouter } from 'vue-router'

const paginationData = ref(null)
const paginationPage = ref(1)

const options = ref({
  hideCount: true,
  edgeNavigation: true
})

const search = ref('')

const router = useRouter()
const axios = inject('axios')

const products = ref([])

const socket = inject('socket')

socket.on('updateMenu', () => {
  loadProducts()
})

const totalProducts = computed(() => {
  return products.value.length
})

const loadProducts = () => {
  axios.get('menu?page=' + paginationPage.value + '&search=' + search.value)
    .then((response) => {
      products.value = response.data.data
      paginationData.value = response.data.meta
    })
    .catch((error) => {
      console.log(error)
    })
}

const editProduct = (produto) => {
  router.push({ name: 'MenuId', params: { id: produto.id } })
}

const createProduct = () => {
  router.push({ name: 'create', params: { id: -1 } })
}

onMounted(() => {
  loadProducts()
})

</script>

<template>
  <h3 style="display: inline; margin-inline-end: 0.5rem;">Menu</h3>
  <input class="form-control" style="width: 15rem; display:inline;" type="text" placeholder="Search" aria-label="Search"
    name="substring" v-model="search" @keyup="loadProducts">
  <MenuTable :products="products" @edit="editProduct" @create="createProduct" @loadProducts="loadProducts">
  </MenuTable>
  <Pagination v-model="paginationPage" :options="options" :records="paginationData ? paginationData.total : 0"
    :per-page="paginationData ? paginationData.per_page : 0" @paginate="loadProducts"></Pagination>

</template>