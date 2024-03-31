<script setup>
import { useUserStore } from "../stores/user.js"

const userStore = useUserStore()

</script>

<template>
  <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
    <h1 class="h2">Dashboard</h1>
  </div>
  <div>
    <h4>Welcome {{ userStore.user ? userStore.user.name : 'anonymous' }}</h4>
    <div v-if="userStore.user">
      <p>This is the Fastuga restaurant website! </p>
      On the left you can access the website main functions.
      <p>On the top right hand corner you can access your profile, where you can edit your information or change your
        password.
      </p>
    </div>
    <div v-if="!userStore.user">
      <p>On the left you can see the menu and order.
      </p>
      <p><b style="color: red; text-decoration-line: underline;">You do need an account to order.</b> </p>
      But if you wish you can create one by tapping on the register option in the top right.
      <strong>
        <p style="color: green">Having an account lets you save your payment information and save up points which you
          can
          trade in for
          discounts
          in the future!
        </p>
      </strong>
    </div>
  </div>
</template>
  