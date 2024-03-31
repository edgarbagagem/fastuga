<script setup>

import { onMounted, inject, ref } from 'vue'
import Item from './Item.vue';
import { useUserStore } from "../../stores/user.js"

const toast = inject('toast')
const axios = inject('axios')
const socket = inject("socket")
const userStore = useUserStore()
const ticketNumberSearch = ref('')
const orderLocalNumberSearch = ref('')
const orderItem = ref([])
const items = ref([])

const loadOrderItems = () => {
  //console.log("refreshing...")
  axios.get('orders/items/' + userStore.userId + '?ticket=' + ticketNumberSearch.value + '&local=' + orderLocalNumberSearch.value)
    .then((response) => {
      //console.log(response)
      items.value = response.data.data
    })
    .catch((error) => {
      console.log(error)
    })

}

socket.on('updatedOrderItem', (orderItem) => {
  // console.log("refeshing...")
  toast.success(`An item was updated! reloading...`)
  loadOrderItems()
})

socket.on('orderCanceled', () => {
  toast.info('Order was canceled')
  loadOrderItems()
})

socket.on('newHotDish', (product) => {
  loadOrderItems()

})

onMounted(() => {
  loadOrderItems()
})

</script>

<template>
  <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
    <h1 class="h2">Order items to prepare</h1>
  </div>
  <div>


    <h1 class="h4">Assigned to you (Preparing)</h1>
    <div style="padding:10px">
      <label>Ticket Nº: </label>
      <input class="form-control" style="width: 15rem" type="text" placeholder="Search" aria-label="Search"
        name="substring" v-model="ticketNumberSearch" @keyup="loadOrderItems">
    </div>
    <div style="padding:10px">
      <label>Order Local Nº: </label>
      <input class="form-control" style="width: 15rem" type="text" placeholder="Search" aria-label="Search"
        name="substring" v-model="orderLocalNumberSearch" @keyup="loadOrderItems">
    </div>

    <table>
      <tr>
        <td th style="width:15%">name</td>
        <td th style="width:50%">description</td>
        <td style="width:6%">order local number</td>
        <td style="width:6%">order id</td>
        <td style="width:6%">picture</td>
      </tr>
    </table>
    <ul class="list-group">
      <Item v-for="item in items" :key="item" :item="item" :status="'P'" @refresh="loadOrderItems"></Item>
    </ul>

    <br>
    <hr class="hr hr-blurry" />
    <br>

    <h1 class="h4">Waiting for a chef...</h1>
    <table>
      <tr>
        <td th style="width:15%">name</td>
        <td th style="width:50%">description</td>
        <td style="width:6%">order local number</td>
        <td style="width:6%">order id</td>
        <td style="width:6%">picture</td>
      </tr>
    </table>
    <ul class="list-group">
      <Item v-for="item in items" :key="item" :item="item" :status="'W'" @refresh="loadOrderItems"></Item>
    </ul>

  </div>
</template>
<style>
#searchByTicket {
  width: 15%;
}

button {
  margin-left: 3px;
  margin-right: 3px;
}
</style>