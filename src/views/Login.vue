<script setup>
import AuthPageTemplate from "@/components/AuthPageTemplate.vue";
import {ref} from "vue";

const remember = ref(false)
const changeRememberValue = () => {
  remember.value = !remember.value;
};
</script>

<template>
  <AuthPageTemplate>
    <h2 class="my-4">{{$t('common.sign_in')}}</h2>
    <form>
      <div class="form-floating mb-3">
        <input type="email" class="form-control" id="email" placeholder="name@example.com">
        <label for="email">{{$t('common.email')}}</label>
      </div>
      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="password" placeholder="Password">
        <label for="password">{{$t('common.password')}}</label>
      </div>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="form-check mb-0">
          <input class="form-check-input me-2" type="checkbox" v-model="remember" @change="changeRememberValue" id="formRememberMe">
          <label class="form-check-label" for="formRememberMe">{{$t('login.remember_me')}}</label>
        </div>
        <a href="#" class="link-underline link-underline-opacity-0">{{$t('login.forgot_password')}}</a>
      </div>
      <button class="btn btn-primary btn-lg w-100 mt-3 px-5">{{$t('common.sign_in')}}</button>
    </form>
    <template #note>
      <span>{{$t('login.no_account')}}</span>
      <router-link class="link-underline link-underline-opacity-0 ps-1" :to="{name: 'register'}">{{$t('common.sign_up')}}</router-link>
    </template>
  </AuthPageTemplate>
</template>