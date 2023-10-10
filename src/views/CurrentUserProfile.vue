<script setup>
import {computed} from 'vue';
import {useStore} from 'vuex';

const store = useStore();

const currentUser = computed(() => store.state.auth.user);
</script>

<template>
  <div v-if="currentUser" class="container fs-5">
    <h1 class="fw-bold mt-5 mb-4">
      {{ currentUser.email }}</h1>
  </div>
</template>

<style scoped lang="scss">

</style>