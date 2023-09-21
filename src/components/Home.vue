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
  <div class="container home">
    <h1 class="title">Project Quizzes</h1>
    <p class="home__greeting">Welcome to my quiz project!</p>
    <h2 style="margin-top: 3rem">API Response:</h2>
    <div>{{ apiData }}</div>
  </div>
</template>

<style scoped lang="scss">
@use "../assets/styles/home";
</style>