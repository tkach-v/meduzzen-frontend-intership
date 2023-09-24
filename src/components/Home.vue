<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const apiData = ref(null);

onMounted(async () => {
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const response = await axios.get(baseURL);
    apiData.value = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
</script>

<template>
  <div class="container text-center my-auto">
    <h1 class="fw-bold">Project Quizzes</h1>
    <p class="">Welcome to my quiz project!</p>
    <h2 class="mt-4">API Response:</h2>
    <div>{{ JSON.stringify(apiData) }}</div>
  </div>
</template>