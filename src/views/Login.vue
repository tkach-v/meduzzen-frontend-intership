<script setup>

import AuthPageTemplate from "@/components/AuthPageTemplate.vue";
</script>

<template>
  <AuthPageTemplate>
    <h2 class="my-4">Sign in</h2>
    <form>
      <div class="form-floating mb-3">
        <input type="email" class="form-control" id="email" placeholder="name@example.com">
        <label for="email">Email address</label>
      </div>
      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="password" placeholder="Password">
        <label for="password">Password</label>
      </div>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="form-check mb-0">
          <input class="form-check-input me-2" type="checkbox" value="" id="form2Example3">
          <label class="form-check-label" for="form2Example3">Remember me</label>
        </div>
        <a href="#" class="link-underline link-underline-opacity-0">Forgot password?</a>
      </div>
      <button class="btn btn-primary btn-lg w-100 mt-3 px-5" type="submit" style="">Sign in</button>
    </form>
    <template #note>
      <span>Don't have an account? </span>
      <router-link class="link-underline link-underline-opacity-0" :to="{name: 'register'}">Sign up</router-link>
    </template>
  </AuthPageTemplate>
</template>