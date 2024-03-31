<script setup>
import { ref, inject } from "vue"
import { useUserStore } from "../../stores/user.js"
import { useRouter } from "vue-router"

const router = useRouter()
const userStore = useUserStore()
const toast = inject("toast")

const passwords = ref({
  oldpassword: "",
  password: "",
  password_confirmation: "",
})

const passwordConfirmation = ref(null)

const emit = defineEmits(["changedPassword"])

const changePassword = async () => {
  if (passwords.value.password != passwords.value.password_confirmation) {
    toast.warning('"Current Password" and "Password Confirmation" are not the same!')
    passwords.value.password_confirmation = ""
    passwordConfirmation.value.focus()
    return
  }
  if (await userStore.changePassword(passwords.value)) {
    toast.success("Password has been changed correctly!")
    emit("changedPassword")
    router.back()

  } else {
    passwords.value.password_confirmation = ""
    toast.error("Password has not been changed!")
  }
}
</script>

<template>
  {{ userStore.errors }}
  <form class="row g-3 needs-validation" novalidate @submit.prevent="changePassword">
    <h3 class="mt-5 mb-3">Change Password</h3>
    <hr />
    <div class="mb-3">
      <div class="mb-3">
        <label for="inputCurrentPassword" class="form-label">Current Password</label>
        <input type="password" class="form-control" id="inputCurrentPassword" required
          v-model="passwords.oldpassword" />
        <field-error-message :errors="userStore.errors" fieldName="oldpassword"></field-error-message>
      </div>
    </div>
    <div class="mb-3">
      <div class="mb-3">
        <label for="inputPassword" class="form-label">New Password</label>
        <input type="password" class="form-control" id="inputPassword" required v-model="passwords.password" />
        <field-error-message :errors="userStore.errors" fieldName="password"></field-error-message>
      </div>
    </div>
    <div class="mb-3">
      <div class="mb-3">
        <label for="inputPasswordConfirm" class="form-label">Password Confirmation</label>
        <input type="password" class="form-control" id="inputPasswordConfirm" ref="passwordConfirmation" required
          v-model="passwords.password_confirmation" />
        <field-error-message :errors="userStore.errors" fieldName="password_confirmation"></field-error-message>
      </div>
    </div>
    <div class="mb-3 d-flex justify-content-center">
      <button type="button" class="btn btn-primary px-5" @click="changePassword">
        Change Password
      </button>
    </div>
  </form>
</template>
