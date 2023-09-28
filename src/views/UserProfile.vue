<script setup>
 import {useRoute} from "vue-router";
 import {reactive} from "vue";

 const route = useRoute()

 const user = reactive({
   firstName: "User first name #1"
 })
</script>

<template>
  <div class="container fs-5">
    <h1 class="fw-bold mt-5 mb-4">Profile of user #{{route.params.id}}</h1>
  </div>
</template>

<style scoped lang="scss">

</style>