<script setup>
import { ref, computed, onMounted, inject, toDisplayString } from 'vue'
import { useRouter } from 'vue-router'
import UserTable from "./UserTable.vue"

const router = useRouter()

const axios = inject('axios')
const toast = inject('toast')
const socket = inject('socket')

const users = ref([])

const paginationData = ref(null)
const paginationPage = ref(1)

const totalUsers = computed(() => {
  return users.value.length
})

const search = ref('')

const options = ref({
  hideCount: true,
  edgeNavigation: true
})

socket.on('updateUser', () => {
  loadUsers()
})

socket.on('deleteUser', () => {
  loadUsers()
})

socket.on('newUser', () => {
  loadUsers()
})

const loadUsers = () => {
  axios.get('users?page=' + paginationPage.value + '&search=' + search.value)
    .then((response) => {
      users.value = response.data.data
      paginationData.value = response.data.meta
    })
    .catch((error) => {
      console.log(error)
    })
}

const editUser = (user) => {
  router.push({ name: 'User', params: { id: user.id } })
}

const deleteUser = (user) => {
  axios.delete('users/' + user.id, user)
    .then((response) => {
      toast.success('User deleted successfully')
      console.log(user)
      socket.emit('deleteUser', user)
      loadUsers()

    })
    .catch((error) => {
      toast.error('Error deleting user')
    })
}

const createUser = () => {
  router.push({ name: 'User', params: { id: -1 } });
}

onMounted(() => {
  loadUsers()
})
</script>

<template>

  <h3 class="mt-5 mb-3">Users </h3>
  <div class="d-flex  justify-content-between">
    <button class="btn btn-primary" @click="createUser()">
      <i class="bi bi-xs bi-trash"></i>
      Create Employee
    </button>
  </div>
  <br>


  <div class="row">
    <div class="form group col-xs-4">
      <input class="form-control" style="width: 15rem" type="text" placeholder="Search" aria-label="Search"
        name="substring" v-model="search" @keyup="loadUsers">
    </div>
  </div>
  <hr>
  <user-table :users="users" :showId="false" @edit="editUser" @delete="deleteUser"></user-table>
  <Pagination v-model="paginationPage" :options="options" :records="paginationData ? paginationData.total : 0"
    :per-page="paginationData ? paginationData.per_page : 0" @paginate="loadUsers"></Pagination>
</template>

<style scoped>
.filter-div {
  min-width: 12rem;
}

.total-filtro {
  margin-top: 2.3rem;
}
</style>

