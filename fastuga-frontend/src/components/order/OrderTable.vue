<script setup>
import { ref, inject, onMounted } from "vue"
import { useOrderStore } from "../../stores/order";
import { useUserStore } from "../../stores/user.js"
import { useTicketNumberStore } from "../../stores/ticketNumber.js"
import axiosService from 'axios'
import { useRouter } from 'vue-router'
const orderStore = useOrderStore()
const userStore = useUserStore()
const message = ref(false)
const isEmpty = ref(true)
const toast = inject('toast')
const errors = ref(null)
const checkout = ref(false)
const router = useRouter()
const axios = inject('axios')
const ticketNumberStore = useTicketNumberStore()
const socket = inject('socket')
const pointsToUse = ref(0)
const paymentOption = ref('')
const paymentReference = ref('')
function isOrderEmpty() {
    if (userStore.userId == -1 && paymentOption.value == '') {
        toast.error("You have to pick a type of payment to place the order!")
    }
    if (isEmpty.value && orderStore.totalProducts > 0) {
        isEmpty.value = !isEmpty.value
    }

    if (!isEmpty.value && orderStore.totalProducts == 0) {
        isEmpty.value = !isEmpty.value
    }

    if (isEmpty.value) {
        toast.error('Your order is empty. Add items to your order and complete the checkout')
    } else {
        //AQUI É QUE SE FAZ O PEDIDO AO SERVIÇO EXTERNO 
        if (userStore.userId != -1) {
            if (userStore.user.points < pointsToUse.value) {
                toast.error("You dont have that many points!")

            } else if ((orderStore.totalPrice - (pointsToUse.value / 10) * 5) < 0) {
                toast.error("Oops. Seems like the price is not a valid value!")
            }
        }
        createPayment()
    }
}

const isCheckout = () => {
    checkout.value = !checkout.value
}

const newPayment = () => {
    return {
        type: '',
        reference: '',
        value: 0,
    }
}

const newOrder = () => {
    return {
        userId: 0,
        status: 'P',
        total_price: 0,
        total_paid: 0,
        payment_type: '',
        payment_reference: '',
        date: new Date(),
        ticket_number: 0,
        customer_id: 0,
        points_gained: 0,
        points_used_to_pay: 0,
        total_paid_with_points: 0,
        payment_type: ''
    }
}


const createPayment = () => {
    errors.value = null
    const payment = ref(newPayment())
    if (userStore.userId != -1) {
        if (paymentOption.value != 'mbway' && paymentOption.value != 'paypal' && paymentOption.value != 'visa' && paymentOption.value != '') {
            payment.value.type = (userStore.user.default_payment_type).toLowerCase()
            payment.value.reference = userStore.user.default_payment_reference
        } else {
            payment.value.type = paymentOption.value
            payment.value.reference = paymentReference.value
            //Aqui o valor do apgamento é quando o customer muda o default payment p outro
        }

    } else {
        payment.value.type = paymentOption.value
        payment.value.reference = paymentReference.value
    }
    payment.value.value = parseFloat(orderStore.totalPrice)
    axiosService.post('https://dad-202223-payments-api.vercel.app/api/payments ', payment.value)
        .then((response) => {
            toast.success('Payment was successfull.')

            const order = ref(newOrder())
            if (!userStore.user) {
                order.value.userId = 0
                order.value.total_price = parseFloat(orderStore.totalPrice)
                order.value.total_paid = parseFloat(orderStore.totalPrice)
                order.value.payment_type = paymentOption.value
                order.value.payment_reference = paymentReference.value
                //aaaaaaaaa
                order.value.date = new Date()
                order.value.date = order.value.date.getFullYear() + "/" + (order.value.date.getMonth() + 1) + "/" + order.value.date.getDate()
                order.value.ticket_number = ticketNumberStore.ticket
            }
            else { //para users logados
                if (userStore.user.type == 'C') {
                    order.value.userId = userStore.userId
                }

                order.value.total_price = parseFloat(orderStore.totalPrice)
                order.value.total_paid = parseFloat((orderStore.totalPrice - (pointsToUse.value / 10) * 5).toFixed(2))
                order.value.payment_type = payment.value.type
                order.value.payment_reference = payment.value.reference
                order.value.date = new Date()
                order.value.date = order.value.date.getFullYear() + "/" + (order.value.date.getMonth() + 1) + "/" + order.value.date.getDate()
                order.value.ticket_number = ticketNumberStore.ticket
                order.value.points_gained = userStore.calculatePoints(order.value.total_paid) ? userStore.calculatePoints(order.value.total_paid) : 0;
                //order.value.paymentOption = paymentOption.value
                if (pointsToUse.value != 0) {
                    order.value.points_used_to_pay = pointsToUse.value
                    order.value.total_paid_with_points = parseFloat(((pointsToUse.value / 10) * 5).toFixed(2))
                    userStore.discountPoints(order.value.points_used_to_pay);
                }
            }


            console.log(order.value)
            axios.post('orders', order.value)
                .then((response) => {
                    order.value = response.data.data
                    socket.emit('newOrder')
                    var product = ref(null)
                    for (product of orderStore.productsInOrder) {
                        console.log(product)
                        if (product.type == 'hot dish') {
                            socket.emit('newHotDish', product)
                        }
                    }
                    orderStore.saveOrderItems(order)
                }).catch((error) => {
                    if (error) {
                        toast.error('Payment was not successfull.')
                    }
                })
            ticketNumberStore.incrementTicket()
            router.back()
        })
        .catch((error) => {
            if (error.response.data.message == "payment limit exceeded") {
                if (paymentOption.value = 'mbway') {
                    toast.error("Payment limit exceeded. Maximum value with MBWay is 10€")
                } else if (paymentOption.value = 'paypal') {
                    toast.error("Payment limit exceeded. Maximum value with PayPal is 50€")
                } else if (paymentOption.value = 'visa') {
                    toast.error("Payment limit exceeded. Maximum value with Visa is 200€")
                }

            } else if
                (error.response.status == 422) {
                toast.error('Payment was not successful. Unprocessable Entity')
                errors.value = error.response.data.errors
            } else {
                toast.error('Payment was not created due to unknown server error!')
            }
        })


}

</script>
<template>
    <table class="table" v-if="orderStore.totalProducts">
        <thead>
            <tr>
                <th class="align-middle">Product</th>
                <th class="align-middle">Description</th>
                <th class="align-middle">Photo</th>
                <th class="align-middle">Price</th>
                <th class="align-middle"></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="produto in orderStore.productsInOrder" :key="produto.id" class="align-middle">
                <td class="align-middle"> {{ produto.name }}</td>
                <td class="align-middle"> {{ produto.description }}</td>
                <td class="align-middle">
                    <img :src="orderStore.photoFullUrl(produto)" class="rounded-circle img_photo" />
                </td>
                <td class="align-middle"> {{ produto.price + "€" }}</td>
                <td>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-xs btn-danger" id="removeProdBtn"
                            @click="orderStore.removeProducts(produto)">
                            <i class="bi bi-xs bi-trash">Remove</i>
                        </button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="vertical-center" v-show="!checkout" v-if="orderStore.totalProducts">
        <div id="d-flex justify-content-end">
            <a id="qty">Quantity: {{ orderStore.totalProducts ? orderStore.totalProducts : "0" }}</a>

        </div>
        <div id="d-flex justify-content-end">
            <a id="price">Price: {{ orderStore.totalPrice ? orderStore.totalPrice : "0" }} €</a>
        </div>
        <button class="btn btn-xs" id="checkoutBtn" @click="isCheckout">
            <i class="bi bi-xs">Go to Checkout</i>
        </button>
    </div>
    <div class="vertical-center" id="checkout" v-show="checkout">
        <hr>
        <a id="yourOrder">Your Order: #{{ ticketNumberStore.ticket }}</a>
        <div class="vertical-right">
            <a id="qty"><b>Quantity: {{ orderStore.totalProducts ? orderStore.totalProducts : "0" }}</b></a>
        </div>
        <div class="vertical-right">
            <a id="price"><b>Price: {{ orderStore.totalPrice ? orderStore.totalPrice : "0" }} €</b></a>
        </div>
        <div v-if="userStore.user">
            <div class="vertical-right">
                <a id="price"><b>My Points: {{ userStore.user.points ? userStore.user.points : "0" }}</b></a>
            </div>
            <div class="vertical-right">
                <a id="price"><b>Use points to have a discount: </b></a>
            </div>
            <div class="vertical-right">
                <a id="price"><b>Price with discount: {{ pointsToUse != 0 ? (orderStore.totalPrice - (pointsToUse / 10)
                        *
                        5).toFixed(2)
                        :
                        orderStore.totalPrice
                }} €</b></a>
            </div>
            <div class="vertical-right">
                <input class="quantity" id="id_form-0-quantity" min="0" name="form-0-quantity" type="number" step="10"
                    v-model="pointsToUse">
            </div>
        </div>

        <div class="vertical-right" id="selectPaymentType">
            <div id="paymentOptions" style="padding-bottom: 10px;">
                <a><b>Payment Options: </b></a>
            </div>
            <select class="form-select" name="tipoPagamento" v-model="paymentOption">
                <option value="Default" v-if="userStore.userId != -1">Default payment type: {{
                        userStore.user.default_payment_type
                }}
                </option>
                <option value="mbway"><b>MBWAY</b></option>
                <option value="paypal">PAYPAL</option>
                <option value="visa">VISA</option> <!-- Continuar aqui. Se for um dos tipos escolhidos pedir as cenas como faço c o anonimo
                se for default type payment é como era antes -->
            </select>
            <div v-if="paymentOption == 'mbway'" style="padding-top: 10px">
                <input type="text" class="form-control" id="inputName" placeholder="MBWay Phone Number"
                    v-model="paymentReference" required />
            </div>
            <div v-if="paymentOption == 'paypal'" style="padding-top: 10px">
                <input type="text" class="form-control" id="inputName" placeholder="PayPal Email"
                    v-model="paymentReference" required />
            </div>
            <div v-if="paymentOption == 'visa'" style="padding-top: 10px">
                <input type="text" class="form-control" id="inputName" placeholder="VISA Card ID (16 digits)"
                    v-model="paymentReference" required />
            </div>
        </div>
        <div id="placeOrderDiv">
            <button class="btn btn-xs" id="placeOrderBtn" @click="isOrderEmpty">
                <i class="bi bi-xs">Place Order</i>
            </button>
        </div>
    </div>

    <div id="noProductsText">
        <a v-if="!orderStore.totalProducts">To see your order, add products first.</a>
    </div>
</template> 
<style>
.hr {
    margin: 0;
    position: relative;
    top: 25%;
}

#removeProdBtn {
    margin-top: 10px;
    margin-bottom: 10px;
    width: 80px;
}

#yourOrder {
    margin-top: auto;
    font-size: 35px;
}

#checkoutBtn,
#placeOrderBtn {
    background-color: #505050;
    color: #ffffff;
}

.vertical-center {
    margin: 0;
    position: relative;
    top: 20%;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
}

#checkout {
    text-align: center;
}

#placeOrderDiv {
    padding: 20px;
}

#selectPaymentType {
    padding: 10px;
}

#paymentOptions {
    padding-top: 20px;
}

#noProductsText {
    text-align: center;
    margin-top: auto;
    margin-bottom: auto;
    font-size: 20px;
    font-weight: bold;
    padding-top: 240px;
}
</style>