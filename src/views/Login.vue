<script setup>
import AuthPageTemplate from "@/components/AuthPageTemplate.vue";
import {ref} from 'vue';
import {ErrorMessage, Field, Form} from 'vee-validate';
import * as yup from 'yup';
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import i18n from "@/i18n/index"
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const store = useStore()
const router = useRouter()
const message = ref('');

const schema = yup.object().shape({
  email: yup
      .string()
      .required(t('auth.email_required'))
      .email(t('auth.email_invalid')),
  password: yup
      .string()
      .required(t('auth.password_required'))
      .min(8, t('auth.password_small'))
});

const handleLogin = (user) => {
  store.dispatch('auth/login', user).then(
      () => {
        router.push({name: 'profile', params: {locale: i18n.global.locale.value}})
      },
      (error) => {
        message.value = t('login.failed')
      }
  );
};
</script>

<template>
  <AuthPageTemplate>
    <h2 class="my-4">{{ $t('common.sign_in') }}</h2>
    <Form @submit="handleLogin" :validation-schema="schema">
      <div class="form-floating mb-3">
        <Field name="email"
               type="email"
               class="form-control"
               placeholder="name@example.com"/>
        <label for="email">{{ $t('common.email') }}</label>
        <ErrorMessage name="email" class="d-flex mt-2 invalid-feedback" />
      </div>
      <div class="form-floating mb-3">
        <Field name="password"
               type="password"
               class="form-control"
               placeholder="Password"/>
        <label for="password">{{ $t('common.password') }}</label>
        <ErrorMessage name="password" class="d-flex mt-2 invalid-feedback" />
      </div>
      <div class="d-flex justify-content-end align-items-center mb-3">
        <a href="#" class="link-underline link-underline-opacity-0">{{ $t('login.forgot_password') }}</a>
      </div>
      <button class="btn btn-primary btn-lg w-100 mt-3 px-5">{{ $t('common.sign_in') }}</button>
    </Form>
    <div v-if="message"
         class="alert mt-3 alert-danger">
      {{ message }}
    </div>
    <template #note>
      <span>{{ $t('login.no_account') }}</span>
      <router-link class="link-underline link-underline-opacity-0 ps-1" :to="{name: 'register'}">
        {{ $t('common.sign_up') }}
      </router-link>
    </template>
  </AuthPageTemplate>
</template>