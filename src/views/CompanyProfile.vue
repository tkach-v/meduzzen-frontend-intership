<script setup>
 import {useRoute} from "vue-router";

 const route = useRoute()

 defineProps([])
</script>

<template>
  <div class="container fs-5">
    <h1 class="fw-bold mt-5 mb-4">Profile of company #{{route.params.id}}</h1>
  </div>
</template>

<style scoped lang="scss">

</style>