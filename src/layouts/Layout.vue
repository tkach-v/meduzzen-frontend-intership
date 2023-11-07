<script setup>
import Header from "@/layouts/Header.vue";
import Footer from "@/layouts/Footer.vue";
import PushNotifications from "@/components/PushNotifications.vue";
</script>

<template>
  <Header/>
  <main style="margin-top: 70px" class="mb-5">
    <router-view></router-view>
  </main>
  <Footer/>
  <PushNotifications/>
</template>