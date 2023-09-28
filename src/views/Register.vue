<script setup>
import AuthPageTemplate from "@/components/AuthPageTemplate.vue";
</script>

<template>
  <AuthPageTemplate>
    <h2 class="my-4">Sign up</h2>
    <form>
      <div class="form-floating mb-3">
        <input type="email" class="form-control" id="email" placeholder="name@example.com">
        <label for="email">Email address</label>
      </div>
      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="password-1" placeholder="Password">
        <label for="password-1">Create password</label>
      </div>
      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="password-2" placeholder="Password">
        <label for="password-2">Password</label>
      </div>
      <button class="btn btn-primary btn-lg w-100 mt-3 px-5" type="submit" style="">Sign up</button>
    </form>
    <template #note>
      <span>Already have an account? </span>
      <router-link class="link-underline link-underline-opacity-0" :to="{name: 'login'}">Sign in</router-link>
    </template>
  </AuthPageTemplate>
</template>