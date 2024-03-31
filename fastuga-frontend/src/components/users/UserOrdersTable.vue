<script setup>
const props = defineProps({

    orders: {
        type: Array,
        default: () => [],
    }
})
</script>
<template>
    <table class="table">
        <thead>
            <tr>
                <th class="align-middle" style="color: black">Order ID</th>
                <th class="align-middle" style="color: black">Ticket Number</th>
                <th class="align-middle" style="color: black">Date</th>
                <th class="align-middle" style="color: black">Total Price</th>
                <th class="align-middle" style="color: black">Status</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="order in orders" :key="order.id">
                <td class="align-middle">{{ order.id }}</td>
                <td class="align-middle">{{ order.ticket_number }}</td>
                <td class="align-middle">{{ order.date }}</td>
                <td class="align-middle">{{ order.total_price }}</td>
                <td class="align-middle" v-if="order.status == 'D'" style="color: green">Delivered</td>
                <td class="align-middle" v-if="order.status == 'C'" style="color: darkred">Canceled</td>
            </tr>
        </tbody>
    </table>
</template>
<style>

</style>