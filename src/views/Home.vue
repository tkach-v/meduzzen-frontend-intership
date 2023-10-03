<script setup>
import {ref, onMounted, computed} from "vue";
import axios from "axios";

const apiData = ref(null);

onMounted(async () => {
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const {data} = await axios.get(baseURL);
    apiData.value = data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

import {useStore} from 'vuex'

const store = useStore()

const value = computed(() => store.state.test.testValue)

const setValue = (newValue) => {
  store.commit('test/setValue', {value: newValue})
}

const setValueAsync = (newValue) => {
  store.dispatch('test/setValueAsync', {value: newValue})
}
</script>

<template>
  <div class="container text-center">
    <h1 class="fw-bold mt-5">{{ $t("home.header") }}</h1>
    <p class="fs-4">{{ $t("home.description") }}</p>
    <h2 class="fw-bold mt-5">{{ $t("home.api_header") }} (health check):</h2>
    <div>{{ JSON.stringify(apiData) }}</div>
    <hr>
    <h2>Test vuex store value:</h2>
    <p>{{ value }}</p>
    <button class="btn btn-primary me-2" @click="setValue('New Value')">Set Value</button>
    <button class="btn btn-primary" @click="setValueAsync('Async Value')">Set Value Async</button>
  </div>
</template>