<script setup>
import {ref, onMounted} from "vue";
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

import Modal from "@/components/Modal.vue";

let thisModal = ref(null);

function showModal() {
  thisModal.value.show();
}
</script>

<template>
  <div class="container text-center">
    <h1 class="fw-bold mt-5">Project Quizzes</h1>
    <p class="fs-4">Welcome to my quiz project! This is the home page of the project.</p>
    <h2 class="fw-bold mt-5">API Response (health check):</h2>
    <div>{{ JSON.stringify(apiData) }}</div>
    <button
        class="btn btn-lg btn-primary mt-5"
        type="button"
        @click="showModal"
    >Show Modal</button>
    <Modal title="Test modal title" ref="thisModal">
      <h3>Test h3</h3>
      <p><span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo, quasi, ullam? Accusantium alias consequatur dolorem doloribus ducimus error in incidunt iusto numquam perspiciatis quibusdam quis, quod ratione, temporibus ullam veritatis!</span><span>Eum labore qui quia quos unde veritatis. Accusantium animi consectetur debitis dignissimos, dolores, eius eligendi eos esse, eveniet incidunt iste laudantium minus nam omnis sequi similique sit suscipit temporibus voluptatem?</span><span>Aliquid aspernatur blanditiis consequuntur, cumque dignissimos distinctio dolor dolore eaque fugiat iste labore laboriosam laudantium maxime molestiae molestias natus neque numquam odio omnis porro quidem reprehenderit suscipit, vitae voluptate voluptatem.</span></p>
    </Modal>
  </div>
</template>