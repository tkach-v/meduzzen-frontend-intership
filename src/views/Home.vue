<script setup>
import {computed, ref} from "vue";
import {useStore} from 'vuex'

const store = useStore()

const value = computed(() => store.state.test.testValue)

const setValue = (newValue) => {
  store.commit('test/setValue', {value: newValue})
}

const setValueAsync = (newValue) => {
  store.dispatch('test/setValueAsync', {value: newValue})
}

import apiClient from "@/http/axios/apiClient";

const apiResponse = ref(null);

// Make the API request and handle the response
apiClient().get('/api/health_check/')
    .then(response => {
      apiResponse.value = JSON.stringify(response.data);
    })
    .catch(error => {
      console.error('API Error:', error);
    });
</script>

<template>
  <div class="container text-center">
    <h1 class="fw-bold mt-5">{{ $t("home.header") }}</h1>
    <p class="fs-4">{{ $t("home.description") }}</p>
    <hr>

    <h2>Test apiClient response:</h2>
    <p>{{ apiResponse }}</p>
    <hr>

    <h2>Test vuex store value:</h2>
    <p>{{ value }}</p>
    <button class="btn btn-primary me-2" @click="setValue('New Value')">Set Value</button>
    <button class="btn btn-primary" @click="setValueAsync('Async Value')">Set Value Async</button>
  </div>
</template>