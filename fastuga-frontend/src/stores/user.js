import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import avatarNoneUrl from '@/assets/avatar-none.png'

export const useUserStore = defineStore('user', () => {
    const axios = inject('axios')
    const serverBaseUrl = inject('serverBaseUrl')

    const user = ref(null)
    const errors = ref(null)

    const toast = inject('toast')
    const socket = inject('socket')

    socket.on('newHotDish', (product) => {

        toast.info("New hot dish ordered: " + product.name)
        console.log(product)

    })

    socket.on('orderCanceled', (order) => {
        if (user.value.customer_id) {
            if (user.value && (user.value.customer_id == order.customer_id)) {
                toast.info('Your order ' + order.ticket_number + ' was canceled and refunded.')
            }
        }
    })

    socket.on('hotDishReady', (order) => {
        console.log(order)

        toast.info("Hot dish ready")

    })

    socket.on('orderReady', (order) => {
        if (user.value.customer_id) {
            if (user.value && (user.value.customer_id == order.customer_id)) {
                toast.info('Your order number ' + order.ticket_number + ' is ready.')
            }
        }
    })

    socket.on('updateUser', (updatedUser) => {
        console.log(updatedUser)
        if (user.value?.id == updatedUser.id) {
            user.value = updatedUser
            toast.info('Your user profile has been changed!')
        } else {
            toast.info(`User profile #${updatedUser.id} (${updatedUser.name}) has changed!`)
        }
    })

    socket.on('deleteUser', (updatedUser) => {
        console.log(updatedUser)
        toast.info(`User profile #${updatedUser.id} (${updatedUser.name}) has been deleted!`)

    })

    socket.on('newUser', (updatedUser) => {
        console.log(updatedUser)
        toast.info(`User #${updatedUser.id} (${updatedUser.name}) has been created!`)

    })

    socket.on('updateMenu', () => {
        toast.info('The Menu has been updated')
    })

    socket.on('newOrder', () => {
        toast.info('New Order!!!')
    })

    const userPhotoUrl = computed(() => {
        if (!user.value?.photo_url) {
            return avatarNoneUrl
        }
        return serverBaseUrl + '/storage/fotos/' + user.value.photo_url
    })

    const userId = computed(() => {
        return user.value?.id ?? -1
    })

    async function loadUser() {
        try {
            const response = await axios.get('users/me')
            user.value = response.data.data
            if (user.value.type == 'C') {
                axios.get('customers/' + user.value.id)
                    .then((response) => {
                        user.value.customer_id = response.data.data.customer_id;
                        user.value.phone = response.data.data.phone;
                        user.value.nif = response.data.data.nif;
                        user.value.points = response.data.data.points;
                        user.value.default_payment_type = response.data.data.default_payment_type;
                        user.value.default_payment_reference = response.data.data.default_payment_reference;
                    }).catch((error) => {
                        console.log(error)
                    })
            }
        } catch (error) {
            clearUser()
            throw error
        }
    }

    function clearUser() {
        delete axios.defaults.headers.common.Authorization
        sessionStorage.removeItem('token')
        user.value = null
    }

    async function login(credentials) {
        try {
            const response = await axios.post('login', credentials)
            axios.defaults.headers.common.Authorization = "Bearer " + response.data.access_token
            sessionStorage.setItem('token', response.data.access_token)
            await loadUser()
            console.log(user.value)
            socket.emit('loggedIn', user.value)
            return true
        }
        catch (error) {
            clearUser()
            return false
        }
    }

    async function changePassword(passwords) {
        errors.value = null
        if (passwords.password != passwords.password_confirmation) {
            return false
        }
        try {
            await axios.patch('users/' + userId.value + '/password', passwords)
            return true;
        } catch (error) {
            if (error.response.status == 422) {
                errors.value = error.response.data.errors
            }
            return false
        }
    }

    async function logout() {
        try {
            await axios.post('logout')
            socket.emit('loggedOut', user.value)
            clearUser()
            return true
        } catch (error) {
            return false
        }
    }

    async function restoreToken() {
        let storedToken = sessionStorage.getItem('token')
        if (storedToken) {
            axios.defaults.headers.common.Authorization = "Bearer " + storedToken
            await loadUser()
            socket.emit('loggedIn', user.value)
            return true
        }
        clearUser()
        return false
    }


    function calculatePoints(total) {
        user.value.points = user.value.points + Math.floor(total / 10);
        console.log(user.value.points)

        axios.put('customers/' + userId.value + '/points', { points: user.value.points })
            .then((response) => {
                console.log("deu certo")
            }).catch((error) => {
                if (error) {
                    console.log(error.response.status)
                }
            })
    }

    function discountPoints(points) {
        user.value.points = user.value.points - points

        axios.put('customers/' + userId.value + '/points', { points: user.value.points })
            .then((response) => {
                console.log("certo")
            }).catch((error) => {
                console.log("errado")
            })
    }


    return { user, userId, userPhotoUrl, login, logout, restoreToken, errors, changePassword, calculatePoints, discountPoints }
})
