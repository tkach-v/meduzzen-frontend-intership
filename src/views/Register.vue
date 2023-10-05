<script setup>
import AuthPageTemplate from "@/components/AuthPageTemplate.vue";
</script>

<template>
  <AuthPageTemplate>
    <h2 class="my-4">{{$t('common.sign_up')}}</h2>
    <form>
      <div class="form-floating mb-3">
        <input type="email" class="form-control" id="email-input" placeholder="name@example.com">
        <label for="email-input">{{$t('common.email')}}</label>
      </div>
      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="password-create" placeholder="Password">
        <label for="password-create">{{$t('register.create_password')}}</label>
      </div>
      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="password-confirm" placeholder="Password">
        <label for="password-confirm">{{$t('register.confirm_password')}}</label>
      </div>
      <button class="btn btn-primary btn-lg w-100 mt-3 px-5">{{$t('common.sign_up')}}</button>
    </form>
    <template #note>
      <span>{{$t('register.have_account')}}</span>
      <router-link class="link-underline link-underline-opacity-0 ps-1" :to="{name: 'login'}">{{$t('common.sign_in')}}</router-link>
    </template>
  </AuthPageTemplate>
</template>