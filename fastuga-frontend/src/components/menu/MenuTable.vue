<script setup>
import { inject, reactive, watch } from "vue"
import avatarNoneUrl from '@/assets/avatar-none.png'
import MenuDetails from "./MenuDetails.vue"
import { useRouter } from 'vue-router'
import { useUserStore } from "../../stores/user.js"
import OrderTable from '../order/OrderTable.vue'
import { useOrderStore } from "../../stores/order.js"



const serverBaseUrl = inject("serverBaseUrl")
const userStore = useUserStore()
const orderStore = useOrderStore()

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  id: {
    type: Number,
    default: null,
  }
})

const axios = inject('axios')
const toast = inject('toast')
const router = useRouter()
const emit = defineEmits(["loadProducts", "edit", "create"]);

const socket = inject('socket')

const editProduct = (produto) => {
  emit("edit", produto)
}

const createProduct = () => {
  emit("create")
}

const loadProduct = () => {
  emit("loadProducts")
}

const deleteProduct = (produto) => {
  console.log(produto.id)
  axios.delete('menu/' + produto.id)
    .then((response) => {
      loadProduct()
      socket.emit('updateMenu')
      toast.success('Product #' + produto.id + ' was deleted sucessfully.')
    })
    .catch((error) => {
      console.log(error);
      toast.error('Product #' + produto.id + ' was not deleted sucessfully.')
    })
  //VOLTAR A MOSTRAR OS PRODUTOS TODOS DEPOIS DE UM SER ELIMINADO
}

const photoFullUrl = (produto) => {
  return produto.photo_url
    ? serverBaseUrl + "/storage/products/" + produto.photo_url
    : avatarNoneUrl
}


const canManageProducts = () => {
  return userStore.userId != -1 && userStore.user.type == 'EM'
}

const canAddRemoveProductsToOrder = () => {
  return userStore.userId == -1 || userStore.user.type == 'C' //E SE FOR ANÓNIMO TAMBÉM <==============0
}

const addProductToOrder = (produto) => {
  orderStore.productsInOrder.push(produto)
  toast.success(produto.name + ' was successfully added to your order.')
}
</script>

<template>
  <div class="d-flex justify-content-end" v-if="canManageProducts()">
    <button class="btn btn-xs btn-dark" id="create_btn" @click="createProduct()">
      <i class="bi bi-xs bi-pencil">Create</i>
    </button>
  </div>
  <table class="table-menu">
    <thead>
      <tr>
        <th class="th-menu">Product</th>
        <th class="th-menu">Description</th>
        <th class="th-menu">Photo</th>
        <th class="th-menu">Price</th>
        <th class="th-menu"></th>
        <th class="th-menu"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="produto in products" :key="produto.id" class="align-middle">
        <td class="align-middle td-menu"> {{ produto.name }}</td>
        <td class="align-middle td-menu"> {{ produto.description }}</td>
        <td class="align-middle td-menu">
          <img :src="photoFullUrl(produto)" class="rounded-circle img_photo" />
        </td>
        <td class="align-middle td-menu"> {{ produto.price + "€ " }}</td>
        <td class="text-en align-middle td-menu">
          <div class="d-flex justify-content-end" v-if="canManageProducts()">
            <button class="btn btn-xs btn-warning" @click="editProduct(produto)">
              <i class="bi bi-xs bi-pencil">Edit</i>
            </button>
          </div>
          <div class="d-flex justify-content-end" v-if="canAddRemoveProductsToOrder()">
            <button class="btn btn-xs btn-success" id="addToOrder" @click="addProductToOrder(produto)">
              <i class="bi bi-xs">Add to Order</i>
            </button>
          </div>
        </td>
        <td class="text-end align-middle td-menu">
          <div class="d-flex justify-content-end" v-if="canManageProducts()">
            <button class="btn btn-xs btn-danger" @click="deleteProduct(produto)">
              <i class="bi bi-xs bi-trash-fill">Delete</i>
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style>
.table-menu {
  border-collapse: separate;
  border-spacing: 0 15px;
}

.th-menu {
  margin-top: auto;
  background-color: #505050;
  color: white;
}

.th-menu,
.td-menu {

  text-align: center;
  padding: 10px;
}

.img_photo {
  width: 4rem;
  height: 4rem;
}

#create_btn,
#addToOrder {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 80px;
}
</style>