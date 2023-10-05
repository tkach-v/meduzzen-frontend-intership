<script setup>
 import {useRoute} from "vue-router";

 const route = useRoute()

</script>

<template>
  <div class="container fs-5">
    <h1 class="fw-bold mt-5 mb-4">{{$t('company_profile.header')}} #{{route.params.id}}</h1>
  </div>
</template>

<style scoped lang="scss">

</style>