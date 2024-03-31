import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'

export const useOrderStore = defineStore('order', () => {
    const axios = inject('axios')
    const serverBaseUrl = inject('serverBaseUrl')
    const toast = inject('toast')
    const productsInOrder = ref([])
    var addPrice = 0
    const totalProducts = computed(() => {
        return productsInOrder.value.length
    })

    const newOrderItem = () => {
        return {
            id: 0,
            products: []
        }
    }
    const totalPrice = computed(() => {
        addPrice = 0
        productsInOrder.value.forEach(element => {

            addPrice = addPrice + parseFloat(element.price)
        })
        return addPrice.toFixed(2)
    })

    function photoFullUrl(produto) {
        return produto.photo_url
            ? serverBaseUrl + "/storage/products/" + produto.photo_url
            : avatarNoneUrl
    }

    function clearProducts() {
        productsInOrder.value = []
    }

    async function addProducts(newProduct) {
        // Note that when an error occours, the exception should be
        // catch by the function that called the insertProject
        productsInOrder.value.push(newProduct)
        return response.data.data
    }

    async function removeProducts(newProduct) {
        // Note that when an error occours, the exception should be
        // catch by the function that called the insertProject
        let idx = productsInOrder.value.findIndex((t) => t.id === newProduct.id)
        if (idx >= 0) {
            toast.success(newProduct.name + ' was removed successfully from your order.')
            productsInOrder.value.splice(idx, 1)
            addPrice = addPrice - parseFloat(newProduct.price)
        }
    }

    function saveOrderItems(order) {
        const orderItem = ref(newOrderItem())
        orderItem.value.id = order.value.id

        orderItem.value.products = productsInOrder.value

        axios.post('orders/items', orderItem.value)
            .then((response) => {
                console.log("DEU CERTO")
            }).catch((error) => {
                if (error) {
                    //console.log(error.response.status)
                    console.log("DEU ERRADO")
                }
            })

        clearProducts()
    }

    return {
        productsInOrder, totalProducts, totalPrice, clearProducts, addProducts, photoFullUrl, removeProducts, saveOrderItems
    }
})