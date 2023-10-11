<script setup>
import {onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import apiClient from "@/http/axios/apiClient";
import i18n from "@/i18n";
import {useStore} from "vuex";

const store = useStore()
const route = useRoute()
const router = useRouter()
const state = ref(null)
const code = ref(null)

// If state and code params, authenticate user via Google
onMounted(() => {
  if (route.query.code) {
    state.value = route.query.state
    code.value = route.query.code;

    authenticateViaGoogle();
  }
});

const authenticateViaGoogle = async () => {
  try {
    const response = await apiClient.post(`/api/o/google-oauth2/?state=${state.value}&code=${code.value}`);
    store.dispatch('auth/authenticateViaGoogle', response.data).then(
        () => {
          router.push({name: 'profile', params: {locale: i18n.global.locale.value}})
        },
        (error) => {
          console.log("Error. Login failed. ", error)
        }
    )
  } catch (error) {
    console.error('Error:', error);
    router.push({name: 'home', params: {locale: i18n.global.locale.value}})
  }
};
</script>

<template>
  <div class="container text-center">
    <h1 class="fw-bold mt-5">{{ $t("home.header") }}</h1>
    <p class="fs-4">{{ $t("home.description") }}</p>
  </div>
</template>