<script setup>
import { ref, inject, onMounted } from "vue"
import axiosService from 'axios'
const axios = inject('axios')
const toast = inject('toast')

const orders = ref(null)

const paginationData = ref(null)
const paginationPage = ref(1)

const options = ref({
    hideCount: true,
    edgeNavigation: true
})

const search = ref('')

const socket = inject('socket')

socket.on('newOrder', () => {
    loadOrders();
})

const loadOrders = () => {
    axios.get('orders/preparing?page=' + paginationPage.value + '&search=' + search.value)
        .then((response) => {
            orders.value = response.data.data
            paginationData.value = response.data.meta
            console.log(orders)
        })
        .catch((error) => {
            console.log(error)
            toast.error("Error getting orders from database")
        })
}

const deleteClick = (order) => {

    const params = {
        type: (order.payment_type).toLowerCase(),
        value: parseFloat(order.total_price),
        reference: order.payment_reference
    }


    axiosService.post('https://dad-202223-payments-api.vercel.app/api/refunds', params)
        .then((response) => {

            axios.put('orders/' + order.id + '/cancel')
                .then((response) => {
                    toast.success('Order canceled.')
                    loadOrders()
                    socket.emit('orderCanceled', order);
                })
                .catch((error) => {
                    toast.error('Order not canceled due to unknown server error!')
                })


            toast.success('Payment Refunded')
        }).catch((error) => {
            console.log(error)
            if (error.response.status == 422) {
                toast.error('Order not canceled. Payment was not refunded due to validation errors!')

            } else {
                toast.error('Order not canceled. Payment was not refunded due to unknown server error!')
            }
        })


}

onMounted(() => {
    loadOrders()
})
</script>
<template>

    <h3>Preparing Orders</h3>
    <div class="row">
        <div class="form group col-xs-4">
            <input class="form-control" style="width: 15rem" type="text" placeholder="Search" aria-label="Search"
                name="substring" v-model="search" @keyup="loadOrders">
        </div>
    </div>
    <table class="table">
        <thead>
            <tr>
                <th class="align-middle" style="color: black">Order ID</th>
                <th class="align-middle" style="color: black">Customer ID</th>
                <th class="align-middle" style="color: black">Date</th>
                <th class="align-middle" style="color: black">Ticket Number</th>
                <th class="align-middle" style="color: black">Total Price</th>
                <th class="align-middle" style="color: black">Total Paid</th>
                <th class="align-middle" style="color: black">Points Used</th>
                <th class="align-middle" style="color: black">Points Gained</th>
                <th></th>

            </tr>
        </thead>
        <tbody>
            <tr v-for="order in orders" :key="order.id">
                <td class="align-middle">{{ order.id }}</td>
                <td class="align-middle">{{ order.customer_id }}</td>
                <td class="align-middle">{{ order.date }}</td>
                <td class="align-middle">{{ order.ticket_number }}</td>
                <td class="align-middle">{{ order.total_price }}</td>
                <td class="align-middle">{{ order.total_paid }}</td>
                <td class="align-middle">{{ order.points_used_to_pay }}</td>
                <td class="align-middle">{{ order.points_gained }}</td>
                <td class="text-end align-middle">
                    <div class="d-flex justify-content-end">
                        <button class=" btn btn-xs btn-danger" @click="deleteClick(order)">
                            <i class="bi bi-xs bi-trash"></i>
                            Cancel Order
                        </button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
    <Pagination v-model="paginationPage" :options="options" :records="paginationData ? paginationData.total : 0"
        :per-page="paginationData ? paginationData.per_page : 0" @paginate="loadOrders"></Pagination>
</template>