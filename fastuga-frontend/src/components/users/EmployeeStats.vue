<script setup>
import { onMounted, inject } from 'vue';
import { ref } from 'vue'


const props = defineProps({
    user: {
        type: Object,
        required: true,
    }
});

const paginationData = ref(null)
const paginationPage = ref(1)

const options = ref({
    hideCount: true,
    edgeNavigation: true
})


const axios = inject('axios')
const toast = inject('toast')

const stats = ref(null)

const loadStats = () => {
    console.log(props.user)
    axios.get('users/' + props.user.id + '/stats?page=' + paginationPage.value)
        .then((response) => {
            stats.value = response.data
            paginationData.value = response.data.orders
        })
        .catch((error) => {
            toast.error("Error getting employee stats")
        })
}

onMounted(() => {
    loadStats()
})

const show = ref(false)

</script>
<template>
    <div class="form-check form-check-inline">
        <input class="form-check-input" type="checkbox" name="checkBoxStats" value="show" required v-model="show"
            id="inputShow" />
        <label class="form-check-label" for="inputShow" v-if="props.user.type != 'EM'">Show User Statistics</label>
        <label class="form-check-label" for="inputShow" v-if="props.user.type == 'EM'">Show Fastuga Restaurant
            Statistics</label>
    </div>
    <div v-if="props.user.type == 'EC' && show">
        <p class="text-justify"> Total items prepared: <span>{{ stats['total_order_items_prepared']
        }}</span></p>
        <p class="text-justify"> Average price of item prepared: <span>{{ stats['average_price']
        }} €</span></p>
        <p class="text-justify"> Most prepared item: <span>{{ stats['most_prepared_item']
        }}</span></p>

    </div>

    <div v-if="props.user.type == 'ED' && show">
        <p class="text-justify"> Total items delivered: <span>{{ stats['total_order_items_delivered']
        }}</span></p>

        <h5>Orders delivered</h5>
        <table class="table">
            <thead>
                <tr>
                    <th class="align-middle" style="color: black">#</th>
                    <th class="align-middle" style="color: black">Ticket Number</th>
                    <th class="align-middle" style="color: black">Date</th>
                    <th class="align-middle" style="color: black">Total Price</th>
                    <th class="align-middle" style="color: black">Status</th>
                    <th class="align-middle" style="color: black">Payment Type</th>
                    <th class="align-middle" style="color: black">Payment Reference</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="order in stats['orders']['data']" :key="order.id">
                    <td class="align-middle">{{ order.id }}</td>
                    <td class="align-middle">{{ order.ticket_number }}</td>
                    <td class="align-middle">{{ order.date }}</td>
                    <td class="align-middle">{{ order.total_price }}</td>
                    <td class="align-middle" v-if="order.status == 'D'" style="color: green">Delivered</td>
                    <td class="align-middle" v-if="order.status == 'C'" style="color: darkred">Canceled</td>
                    <td class="align-middle">{{ order.payment_type }}</td>
                    <td class="align-middle">{{ order.payment_reference }}</td>
                </tr>
            </tbody>
        </table>
        <Pagination v-if="show" v-model="paginationPage" :options="options"
            :records="paginationData ? paginationData.total : 0"
            :per-page="paginationData ? paginationData.per_page : 0" @paginate="loadStats"></Pagination>
    </div>
    <div v-if="props.user.type == 'EM' && show">
        <p class="text-justify"> Number of customers: <span>{{ stats['customerCount']
        }}</span></p>
        <p class="text-justify"> Customer favorite method of payment: <span>{{ stats['mostUsedPaymentType']
        }}</span></p>
        <p class="text-justify"> Amount of money made from orders: <span>{{ stats['moneyMade']
        }} €</span></p>
        <p class="text-justify"> Best Chef: <span>{{ stats['bestChef']
        }}</span></p>
        <p class="text-justify"> Best Delivery Employee: <span>{{ stats['bestDelivery']
        }}</span></p>
        <p class="text-justify"> Best Product: <span>{{ stats['bestProduct']
        }}</span></p>
        <p class="text-justify"> Active Managers: <span>{{ stats['managerCount']
        }}</span></p>
        <p class="text-justify"> Active Chefs: <span>{{ stats['chefCount']
        }}</span></p>
        <p class="text-justify"> Active Delivery Employees: <span>{{ stats['deliveryCount']
        }}</span></p>
        <p class="text-justify"> Amount of money discounted with points: <span>{{ stats['totalDiscount']
        }} €</span></p>
    </div>
</template>