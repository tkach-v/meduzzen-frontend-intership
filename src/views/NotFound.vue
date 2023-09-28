<script setup>

</script>

<template>
  <div class="container text-center fs-4 mt-5">
    <h1 class="fw-bold fs-1 text-404">404</h1>
    <p class="mb-3">{{$t('not_found.text')}}</p>
    <router-link to="/" class="btn btn-primary btn-lg">{{$t('not_found.btn_text')}}</router-link>
  </div>
</template>

<style scoped lang="scss">
  .text-404 {
    font-size: 9rem !important;
  }
</style>