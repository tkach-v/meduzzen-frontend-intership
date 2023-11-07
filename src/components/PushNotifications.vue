<script setup>
import {toast} from "vue3-toastify";
import {onMounted, ref} from "vue";

const status = ref('disconnected')
const notificationSocket = ref({})

function connect() {
  notificationSocket.value = notificationSocket.value = new WebSocket(`ws:${import.meta.env.VITE_API_BASE_URL}/ws/notification/`)

  notificationSocket.value.onopen = () => {
    status.value = "connected"
    console.log("Connected")
  }

  notificationSocket.value.onmessage = ({data}) => {
    console.log("Message: ", data);
  }

  notificationSocket.value.onerror = function(e) {
    console.error('Error:', e);
  }

  notificationSocket.value.onclose = function (e) {
    console.error('Chat socket closed unexpectedly');
  }
}

onMounted(() => {
  toast.info("Test toast", {
    autoClose: false,
    position: toast.POSITION.BOTTOM_RIGHT,
  })
  connect()
})
</script>

<template>
  <div class="bg-body-secondary py-5">
    <div>{{ status }}</div>
  </div>
</template>