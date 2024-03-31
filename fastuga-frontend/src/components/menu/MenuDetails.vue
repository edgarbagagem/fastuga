<script setup>

import { ref, watch, computed, inject } from 'vue'

import axios from 'axios'

import avatarNoneUrl from '@/assets/avatar-none.png'

const serverBaseUrl = inject("serverBaseUrl")

const props = defineProps({
  produto: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    required: false
  },
})

const emit = defineEmits(["save", "cancel"]);

const editingProduct = ref(props.produto)

watch(
  () => props.produto,
  (newProduct) => {
    editingProduct.value = newProduct
  },
  { immediate: true }
)

const photoFullUrl = computed(() => {
  return editingProduct.value.photo_url
    ? serverBaseUrl + "/storage/products/" + editingProduct.value.photo_url
    : "avatarNoneUrl"
})


const save = () => {
  if (editingProduct.value.id != null) {
    onFileUpload()
  }
  emit("save", editingProduct.value);
}

const cancel = () => {
  emit("cancel", editingProduct.value);
}

const onImageChange = (e) => {
  editingProduct.value.photo_file = e.target.files[0];
}

const onFileUpload = () => {
  if (editingProduct.value.photo_file != null) {
    //upload picture
    var formdata = new FormData()
    formdata.append('photo_file', editingProduct.value.photo_file)
    console.log(formdata);
    axios.defaults.headers.common.Authorization = "Bearer " + sessionStorage.getItem('token')
    axios.post('http://fastugaserver.test/api/products/' + editingProduct.value.id + '/photo', formdata, {
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
  <form class="row g-3 needs-validation" novalidate @submit.prevent="save">
    <h3 class="mt-5 mb-3">Product #{{ editingProduct.id }}</h3>
    <hr />
    <div class="d-flex flex-wrap justify-content-between">
      <div class="w-75 pe-4">
        <div class="mb-3">
          <label for="inputName" class="form-label">Name</label>
          <input type="text" class="form-control" id="inputName" placeholder="Product Name" required
            v-model="editingProduct.name" />
          <field-error-message :errors="errors" fieldName="name"></field-error-message>
        </div>


        <div class="d-flex ms-1 mt-4 flex-wrap justify-content-between">
          <div class="mb-3 me-3 flex-grow-1">

          </div>

          <div class="mb-3 ms-xs-3 flex-grow-1">

            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="radioType" value="drink" required
                v-model="editingProduct.type" id="inputTypeDrink" />
              <label class="form-check-label" for="inputTypeDrink">Drink</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="radioType" value="hot dish"
                v-model="editingProduct.type" id="inputTypeHot" />
              <label class="form-check-label" for="inputTypeHot">Hot Dish</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="radioType" value="cold dish"
                v-model="editingProduct.type" id="inputTypeCold" />
              <label class="form-check-label" for="inputTypeCold">Cold Dish</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="radioType" value="dessert"
                v-model="editingProduct.type" id="inputTypeDessert" />
              <label class="form-check-label" for="inputTypeDessert">Dessert</label>
            </div>
            <field-error-message :errors="errors" fieldName="type"></field-error-message>
          </div>
        </div>
        <div class="mb-3 px-1">
          <label for="inputDescription" class="form-label">Price</label>
          <input type="price" class="form-control" id="inputPrice" placeholder="Price" required
            v-model="editingProduct.price" />
          <field-error-message :errors="errors" fieldName="price"></field-error-message>
        </div>
        <div class="mb-3 px-1">
          <label for="inputDescription" class="form-label">Description</label>
          <input type="price" class="form-control" id="inputDescription" placeholder="Description" required
            v-model="editingProduct.description" />
          <field-error-message :errors="errors" fieldName="description"></field-error-message>
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