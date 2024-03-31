<script setup>
import { ref, watch, computed, inject } from "vue";
import avatarNoneUrl from '@/assets/avatar-none.png'
import axios from 'axios';
import { useUserStore } from "../../stores/user";

const serverBaseUrl = inject("serverBaseUrl");

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    required: false
  },
})

const userStore = useUserStore()

const toast = inject('toast')

const emit = defineEmits(["save", "cancel"]);

const editingUser = ref(props.user)

watch(
  () => props.user,
  (newUser) => {
    editingUser.value = newUser
  },
  { immediate: true }
)

const photoFullUrl = computed(() => {
  return editingUser.value.photo_url
    ? serverBaseUrl + "/storage/fotos/" + editingUser.value.photo_url
    : avatarNoneUrl
})

const points = computed(() => {
  return editingUser.value.points
})

const save = () => {
  if (editingUser.value.id) {
    onFileUpload()
  }
  emit("save", editingUser.value);
}

const cancel = () => {
  emit("cancel", editingUser.value);
}

const onImageChange = (e) => {
  editingUser.value.photo_file = e.target.files[0];
}
const onFileUpload = () => {
  if (editingUser.value.photo_file != null) {
    //upload picture
    var formdata = new FormData()
    formdata.append('photo_file', editingUser.value.photo_file)
    axios.defaults.headers.common.Authorization = "Bearer " + sessionStorage.getItem('token')
    axios.post('http://fastugaserver.test/api/users/' + editingUser.value.id + '/photo', formdata, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(() => {
        toast.success("Photo was updated successfully.")
      })
      .catch((error) => {
        console.log(error)
        toast.error(
          "Photo was not updated due to unknown server error!"
        )
      })
  }
}

</script>

<template>
  <form class="row g-3 needs-validation" enctype="multipart/form-data" novalidate @submit.prevent="save">
    <h3 class="mt-5 mb-3" v-if="editingUser.id != null">User #{{ editingUser.id }}
      <span v-if="editingUser.type == 'EM'" class="text-success">Manager</span>
      <span v-if="editingUser.type == 'EC'" class="text-info">Chef</span>
      <span v-if="editingUser.type == 'ED'" class="text-danger">Delivery</span>
      <span v-if="editingUser.type == 'C'" class="text-warning">Customer</span>
    </h3>
    <h3 class="mt-5 mb-3" v-if="editingUser.type == 'C'">
      <span>My Points: {{ points }}</span>
    </h3>
    <h3 class="mt-5 mb-3" v-if="editingUser.id == null">New User</h3>
    <hr />
    <div class="d-flex flex-wrap justify-content-between">
      <div class="w-75 pe-4">
        <div class="mb-3 px-1">
          <label for="inputName" class="form-label">Name</label>
          <input type="text" class="form-control" id="inputName" placeholder="User Name" required
            v-model="editingUser.name" />
          <field-error-message :errors="errors" fieldName="name"></field-error-message>
        </div>

        <div class="mb-3 px-1">
          <label for="inputEmail" class="form-label">Email</label>
          <input type="email" class="form-control" id="inputEmail" placeholder="Email" required
            v-model="editingUser.email" />
          <field-error-message :errors="errors" fieldName="email"></field-error-message>
        </div>

        <div v-if="editingUser.id == null" class="mb-3 px-1">
          <label for="inputPassword" class="form-label">Password</label>
          <input type="password" class="form-control" id="inputPassword" placeholder="Password" required
            v-model="editingUser.password" />
          <field-error-message :errors="errors" fieldName="password"></field-error-message>
        </div>

        <div v-if="(userStore.userId != -1)" class="mb-3 px-1">
          <label class="form-label">Type</label>
          <p v-if="editingUser.type == 'EM'" style="color: darkgreen;">Manager</p>
          <p v-if="editingUser.type == 'EC'" class="text-info">Chef</p>
          <p v-if="editingUser.type == 'ED'" class="text-danger">Delivery</p>
          <p v-if="editingUser.type == 'C'" class="text-warning">Customer</p>
          <div v-if="(userStore.userId != -1) && (userStore.user.type == 'EM') && (editingUser.type != 'C')"
            class="mb-3 ms-xs-3 flex-grow-1">
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="radioType" value="EM" required
                v-model="editingUser.type" id="inputTypeEM" />
              <label class="form-check-label" for="inputGenderM">Employee Manager</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="radioType" value="EC" required
                v-model="editingUser.type" id="inputTypeEC" />
              <label class="form-check-label" for="inputGenderM">Employee Chef</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="radioType" value="ED" required
                v-model="editingUser.type" id="inputTypeED" />
              <label class="form-check-label" for="inputGenderM">Employee Delivery</label>
            </div>
            <!-- <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="radioType" value="C" required
                v-model="editingUser.type" id="inputTypeC" />
              <label class="form-check-label" for="inputGenderM">Customer</label>
            </div> -->
            <field-error-message :errors="errors" fieldName="type"></field-error-message>
          </div>
          <div v-if="(userStore.userId != -1) && (userStore.user.type == 'EM')" class="mb-3 ms-xs-3 flex-grow-1">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" true-value="1" false-value="0"
                v-model="editingUser.blocked" id="inputBlocked" />
              <label class="form-check-label" for="inputBlocked">
                User is blocked
              </label>
              <field-error-message :errors="errors" fieldName="blocked"></field-error-message>
            </div>
          </div>
        </div>

        <div class="mb-3 px-1" v-if="userStore.userId == -1 || userStore.user.type == 'C'">
          <div class="mb-3">
            <label for="inputPhone" class="form-label">Phone Number</label>
            <input type="text" class="form-control" id="inputPhone" placeholder="Phone Number" required
              v-model="editingUser.phone" />
            <field-error-message :errors="errors" fieldName="phone"></field-error-message>
          </div>
          <div class="mb-3">
            <label for="inputNif" class="form-label">Nif</label>
            <input type="text" class="form-control" id="inputNif" placeholder="Nif" required
              v-model="editingUser.nif" />
            <field-error-message :errors="errors" fieldName="nif"></field-error-message>
          </div>
          <div class="mb-3 ms-xs-3 flex-grow-1">
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="radioType" value="PAYPAL" required
                v-model="editingUser.default_payment_type" id="inputTypePaypal" />
              <label class="form-check-label" for="inputTypePaypal">Paypal</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="radioType" value="MBWAY" required
                v-model="editingUser.default_payment_type" id="inputTypeMbway" />
              <label class="form-check-label" for="inputTypeMbway">MBWay</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="radioType" value="VISA" required
                v-model="editingUser.default_payment_type" id="inputTypeVisa" />
              <label class="form-check-label" for="inputTypeVisa">Visa</label>
            </div>
            <field-error-message :errors="errors" fieldName="default_payment_type"></field-error-message>
          </div>
          <div class="mb-3">
            <label for="inputPaymentReference" class="form-label">Default Payment Reference</label>
            <input type="text" class="form-control" id="inputPaymentReference" placeholder="Payment Reference" required
              v-model="editingUser.default_payment_reference" />
            <field-error-message :errors="errors" fieldName="default_payment_reference"></field-error-message>
          </div>
        </div>



      </div>
      <div class="w-25">
        <div class="mb-3">
          <label class="form-label">Photo</label>
          <div class="form-control text-center">
            <img :src="photoFullUrl" class="w-100" />
          </div>
          <br>
          <input type="file" accept="image/*" class="form-control-file" v-on:change="onImageChange">
        </div>
      </div>
    </div>
    <div class="mb-3 d-flex justify-content-end">
      <button type="button" class="btn btn-primary px-5" @click="save">Save</button>
      <button type="button" class="btn btn-light px-5" @click="cancel">Cancel</button>
    </div>
  </form>
</template>

<style scoped>
.total_hours {
  width: 26rem;
}
</style>
