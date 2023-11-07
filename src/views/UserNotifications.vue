<script setup>
import {onMounted, ref} from 'vue';
import {useI18n} from "vue-i18n";
import apiClient from "@/http/axios/apiClient";

const {t} = useI18n()

const notificationsList = ref([])

async function fetchUserNotifications(url) {
  try {
    const response = await apiClient.get(url)
    const { results, next } = response.data
    notificationsList.value.push(...results)

    if (next) {
      await fetchUserNotifications(next)
    }

  } catch (error) {
    console.error('API Error:', error)
  }
}

async function handleMarkAsRead(notificationId) {
  try {
    await apiClient.post(`/api/notifications/${notificationId}/mark-as-read/`)
    notificationsList.value = notificationsList.value.filter(notification => notification.id !== notificationId);
  } catch (error) {
    console.error('API Error:', error)
  }
}

onMounted(async () => {
  await fetchUserNotifications('/api/notifications/')
})
</script>

<template>
  <div class="container fs-5">
    <h1 class="fw-bold mt-5 mb-4">{{$t('notifications.unread_notifications')}}</h1>
    <div class="list-group rounded-0">
      <div v-for="(notification) in notificationsList"
           :key="notification.id"
           class="alert alert-light" role="alert"
      >
        <div>{{ notification.text }}</div>
        <button class="btn btn-primary mt-2"
                @click="handleMarkAsRead(notification.id)"
        >{{$t('notifications.mark_read')}}</button>
      </div>
    </div>
  </div>
</template>