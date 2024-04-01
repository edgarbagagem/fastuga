<script setup>

import { onMounted, inject, ref } from 'vue'
import OrderList from './OrderList.vue';
import { useUserStore } from "../../stores/user.js"

const axios = inject('axios')
const socket = inject("socket")
const userStore = useUserStore()
const toast = inject("toast")


const items = ref([])
const products = ref([])

const loadOrders = () => {

  axios.get('orders/employee/' + userStore.user.id)
    .then((response) => {
      items.value = response.data.data
    })
    .catch((error) => {
      console.error(error)
    })

}

socket.on('updatedOrder', (order) => {
  loadOrders()
})

socket.on('updatedOrderItem', (orderItem) => {
  loadOrders()
})


socket.on('newOrder', () => {
  loadOrders()
})

const loadProducts = () => {

  axios.get("orders/employee/" + userStore.user.id + "/products")
    .then((response) => {
      products.value = response.data.data
    })
    .catch((error) => {
      console.error(error)
    })

}


const filterProducts = (products, orderId) => {
  var list = [];
  var asObject;

  for (let i = 0; i < products.length; i++) {
    asObject = JSON.parse(JSON.stringify(products[i]))

    if (orderId == asObject.id) {
      list.push(asObject)
    }

  }

  return list;
}

const refresh = () => {
  loadOrders()
  loadProducts()
}

onMounted(() => {
  refresh()
})

</script>

<template>
  <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
    <h1 class="h2">Orders to prepare and deliver</h1>
  </div>
  <div>


    <h1 class="h4">Ready to deliver, assigned to you</h1>
    <ul class="list-group">
      <OrderList v-for="item in items" :key="item" :item="item" :products="filterProducts(products, item.id)"
        :status='"R"' @refresh="refresh"></OrderList>
    </ul>

    <br>
    <hr class="hr hr-blurry" />
    <br>

    <h1 class="h4">Preparing...</h1>
    <ul class="list-group">
      <OrderList v-for="item in items" :key="item" :item="item" :products="filterProducts(products, item.id)"
        :status='"P"' @refresh="refresh"></OrderList>
    </ul>

  </div>
</template>