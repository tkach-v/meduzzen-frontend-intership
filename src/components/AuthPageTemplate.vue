<script setup>
import LocalizedLink from "@/components/LocalizedLink.vue";
</script>

<template>
  <div class="container my-auto">
    <div class="mx-auto p-4 border border-1 text-center" style="max-width: 400px; border-radius: 1.5rem">
      <LocalizedLink class="navbar-brand fs-3 fw-bold" :to="{name: 'home'}">Quizzes</LocalizedLink>
      <slot></slot>
      <hr class="my-4">
      <div class="d-flex flex-column gap-2 mb-3">
        <button class="btn btn-lg w-100 d-flex align-items-center border border-1" type="submit">
          <img class="btn-icon" src="@/assets/images/icons/google.svg" alt="">
          <span>{{$t('common.continue_with')}} Google</span>
        </button>
      </div>
      <div>
        <slot name="note"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.btn-icon {
  height: 1.5rem;
  width: auto;
  margin-right: 1rem;
}
</style>