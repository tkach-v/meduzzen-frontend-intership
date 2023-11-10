<script setup>
import {toast} from "vue3-toastify";
import {onMounted, ref} from "vue";
import TokenService from "@/services/token.service";

const notificationSocket = ref({})

function connect() {
  const token = TokenService.getLocalAccessToken()
  if (!token) {
    return
  }

  notificationSocket.value = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_BASE_URL}/ws/notification/?token=${token}`)

  notificationSocket.value.onmessage = ({data}) => {
    toast.info(data, {
      autoClose: false,
      position: toast.POSITION.BOTTOM_RIGHT,
    })
  }

  notificationSocket.value.onerror = function (error) {
    console.error('Error:', error);
  }

  notificationSocket.value.onclose = function () {
    console.error('Chat socket closed unexpectedly');
  }
}

onMounted(() => {
  connect()
})
</script>