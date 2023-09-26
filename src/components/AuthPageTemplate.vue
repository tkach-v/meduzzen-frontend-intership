<script setup>
import { useRoute } from "vue-router";
import {computed} from "vue";

const route = useRoute();

const isLoginPage = computed(() => route.name === "login");
const promptText = computed(() => (isLoginPage.value ? "Don't have an account? " : "Already have an account? "));
const linkText = computed(() => (isLoginPage.value ? "Sign up" : "Sign in"));
const linkTo = computed(() => (isLoginPage.value ? { name: "register" } : { name: "login" }));
</script>

<template>
  <div class="container my-auto">
    <div class="mx-auto p-4 border border-1 text-center" style="max-width: 400px; border-radius: 1.5rem">
      <router-link class="navbar-brand fs-3 fw-bold" to="/">Quizzes</router-link>
      <slot></slot>
      <hr class="my-4">
      <div class="d-flex flex-column gap-2 mb-3">
        <button class="btn btn-lg w-100 d-flex align-items-center border border-1" type="submit">
          <img class="btn-icon" src="@/assets/images/icons/google.svg" alt="">
          <span>Continue with Google</span>
        </button>
        <button class="btn btn-lg w-100 d-flex align-items-center btn-primary" type="submit">
          <img class="btn-icon" src="@/assets/images/icons/facebook.svg" alt="">
          <span>Continue with Facebook</span>
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