<script setup>
import { ref, inject, onMounted } from 'vue'
import { useUserStore } from "../../stores/user";
import avatarNoneUrl from '@/assets/avatar-none.png'

const props = defineProps(['item', 'status', 'products'])

const errors = ref(null)
const axios = inject('axios')
const toast = inject('toast')
const userStore = useUserStore()
const serverBaseUrl = inject("serverBaseUrl")
const socket = inject('socket')

const emit = defineEmits(["refresh"])

const updateItem = (statusToUpdate) => {

  let cloneItem = Object.assign({}, props.item);
  cloneItem.status = statusToUpdate

  //assign delivered_by
  switch (statusToUpdate) {
    case 'P':
      cloneItem.delivered_by = null
      break;
    case 'R':
      //check if any of the items is still preparing
      //  console.log(orderInfo.value.length)
      for (let i = 0; i < props.products.length; i++) {
        console.log(props.products[i].prod_stat)
        if (props.products[i].prod_stat != 'R') {
          toast.error('Order #' + props.item.id + ' was not updated due to the item "' + props.products[i].name + '" not being ready, wait for a chef!')
          return;
        }
      }



      cloneItem.delivered_by = userStore.user.id
      break;
    case 'D':
      cloneItem.delivered_by = userStore.user.id
      break;
  }

  //console.log(cloneItem)
  errors.value = null
  axios.put('order/' + cloneItem.id, cloneItem)
    .then((response) => {
      console.log(response)
      cloneItem = response.data.data

      if (cloneItem.status == 'R') {
        socket.emit('orderReady', cloneItem);

      }
      toast.success('Order #' + cloneItem.id + ' was updated successfully.')
      socket.emit('updatedOrder', null)
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

const photoFullUrl = (photo_url) => {
  return photo_url
    ? serverBaseUrl + "/storage/products/" + photo_url
    : avatarNoneUrl
}

</script>

<template>
  <div v-if="props.status === 'P'">

    <div v-if="props.item.status === 'P'">
      <li class="list-group-item">


        <div>order number: {{ props.item.id }}, ticket number: {{ props.item.ticket_number }}</div>
        <table>
          <tr>

            <td v-for="product in props.products" :key="product.id">
              <div v-if="product.id == props.item.id">
                <img :src="photoFullUrl(product.photo_url)" class="rounded-circle img_photo" />
                <div>{{ "name:" + product.name }}</div>
                <div>{{ "type:" + product.type }}</div>
                <div>{{ "product_id:" + product.prod_id }}</div>
                <!-- <div >description: <span style="font-size:0.9vw">{{ objeto.description }}</span></div>-->
              </div>
            </td>
          </tr>
        </table>
        <button class="btn btn-xs btn-warning" @click="updateItem('R')">
          <i class="bi bi-xs bi-geo-alt"> Ready, assign to me</i>
        </button>

      </li>
    </div>

  </div>
  <div v-else-if="props.status === 'R'">
    <div v-if="props.item.delivered_by === userStore.user.id">
      <div v-if="props.item.status === 'R'">
        <li class="list-group-item">
          <div>order number: {{ props.item.id }}, ticket number: {{ props.item.ticket_number }}</div>
          <table>
            <tr>
              <td v-for="product in props.products" :key="product.id">
                <template v-if="product.id == props.item.id">
                  <img :src="photoFullUrl(product.photo_url)" class="rounded-circle img_photo" />
                  <div>{{ "name:" + product.name }}</div>
                  <div>{{ "type:" + product.type }}</div>
                  <div>{{ "product_id:" + product.prod_id }}</div>
                  <!-- <div >description: <span style="font-size:0.9vw">{{ objeto.description }}</span></div>-->
                </template>
              </td>
            </tr>
          </table>

          <button class="btn btn-xs btn-success" @click="updateItem('D')">
            <i class="bi bi-xs bi-check-lg"> Delivered</i>
          </button>

          <button class="btn btn-xs btn-danger" @click="updateItem('P')">
            <i class="bi bi-xs bi-x-circle"> Not ready, unassign</i>
          </button>

        </li>
      </div>
    </div>
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
}
</style>
