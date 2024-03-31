<script setup>
import { ref, inject } from 'vue'
import { useUserStore } from "../../stores/user";
import avatarNoneUrl from '@/assets/avatar-none.png'

const props = defineProps(['item', 'status'])

const errors = ref(null)
const serverBaseUrl = inject("serverBaseUrl")
const axios = inject('axios')
const toast = inject('toast')
const userStore = useUserStore()

const socket = inject('socket')

const produto = ref([])

const emit = defineEmits(["refresh"])

const updateItem = (statusToUpdate) => {

    let cloneItem = Object.assign({}, props.item);
    cloneItem.status = statusToUpdate

    //assign prepared_by
    switch (statusToUpdate) {
        case 'W':
            cloneItem.preparation_by = null
            break;
        case 'R':
        case 'P':
            cloneItem.preparation_by = userStore.user.id
            break;
    }

    errors.value = null
    delete cloneItem.name
    delete cloneItem.description
    delete cloneItem.photo_url
    delete cloneItem.type
    axios.put('orders/' + cloneItem.id, cloneItem)
        .then((response) => {
            cloneItem = response.data.data

            console.log(cloneItem)
            if (cloneItem.status == 'R') {
                socket.emit('hotDishReady', cloneItem);
            }
            toast.success('Order #' + cloneItem.id + ' was updated successfully.')
            socket.emit('updatedOrderItem', null)
            emit("refresh");
        })
        .catch((error) => {

            if (error.status == 422) {
                toast.error('Order #' + props.item.id + ' was not updated due to validation errors!')
                errors.value = error.response.data.errors
            } else {
                toast.error('Order #' + props.item.id + ' was not updated due to unknown server error!')
            }
        })
}

const photoFullUrl = (produto) => {
    return produto
        ? serverBaseUrl + "/storage/products/" + produto
        : avatarNoneUrl
}

</script>

<template>
    <div v-if="props.status === 'W' && props.item.status === 'W'">
        <li class="list-group-item">





            <table>
                <tr>
                    <td th style="width:15%">{{ props.item.name }}</td>
                    <td th style="width:50%">{{ props.item.description }}</td>
                    <td style="width:6%">{{ props.item.order_local_number }}</td>
                    <td style="width:6%">{{ props.item.order_id }}</td>
                    <td style="width:6%"><img :src="photoFullUrl(props.item.photo_url)"
                            class="rounded-circle img_photo" /></td>
                </tr>
            </table>

            <button class="btn btn-xs btn-warning" @click="updateItem('P')">
                <i class="bi bi-xs bi-geo-alt"> Assign to me</i>
            </button>


        </li>

    </div>
    <div v-else-if="props.status === 'P' && props.item.status === 'P'">
        <li class="list-group-item">
            <table>
                <tr>
                    <td th style="width:15%">{{ props.item.name }}</td>
                    <td th style="width:50%">{{ props.item.description }}</td>
                    <td style="width:6%">{{ props.item.order_local_number }}</td>
                    <td style="width:6%">{{ props.item.order_id }}</td>
                    <td style="width:6%"><img :src="photoFullUrl(props.item.photo_url)"
                            class="rounded-circle img_photo" /></td>
                </tr>
            </table>

            <button class="btn btn-xs btn-success" @click="updateItem('R')">
                <i class="bi bi-xs bi-check-lg"> Ready</i>
            </button>



            <button class="btn btn-xs btn-danger" @click="updateItem('W')">
                <i class="bi bi-xs bi-x-circle"> Unassign</i>
            </button>


        </li>
    </div>
</template>

<style scoped>
.completed {
    text-decoration: line-through;
}

table,
th,
td {
    border-left: 1px solid black;
    border-right: 1px solid black;
}
</style>
