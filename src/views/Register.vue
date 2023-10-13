<script setup>
import AuthPageTemplate from "@/components/AuthPageTemplate.vue";
import {ref} from 'vue';
import {ErrorMessage, Field, Form} from 'vee-validate';
import * as yup from 'yup';
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import i18n from "@/i18n";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const store = useStore()
const router = useRouter()
const successful = ref(false);
const message = ref('');
const schema = yup.object().shape({
  email: yup
      .string()
      .required(t('auth.email_required'))
      .email(t('auth.email_invalid'))
      .max(50, t('auth.email_large')),
  password: yup
      .string()
      .required(t('auth.password_required'))
      .min(8, t('auth.password_small'))
      .max(40, t('auth.password_large')),
  passwordConfirmation: yup
      .string()
      .required(t('auth.password_confirm_required'))
      .oneOf([yup.ref('password')], t('auth.password_confirm_not_match'))
});

const handleRegister = (user) => {
  message.value = '';
  successful.value = false;

  store.dispatch('auth/register', user).then(
      (data) => {
        message.value = t('register.successful')
        successful.value = true
        router.push({name: 'login', params: {locale: i18n.global.locale.value}});
      },
      (error) => {
        message.value = t('register.failed')
        successful.value = false
      }
  );
};
</script>

<template>
  <AuthPageTemplate>
    <h2 class="my-4">{{ $t('common.sign_up') }}</h2>
    <Form @submit="handleRegister" :validation-schema="schema">
      <div class="form-floating mb-3">
        <Field name="email"
               type="email"
               class="form-control"
               placeholder="user@example.com"/>
        <label for="email">{{ $t('common.email') }}</label>
        <ErrorMessage name="email" class="d-flex mt-2 invalid-feedback"/>
      </div>
      <div class="form-floating mb-3">
        <Field
            name="password"
            type="password"
            class="form-control"
            placeholder="password"/>
        <label for="password">{{ $t('register.create_password') }}</label>
        <ErrorMessage name="password" class="d-flex mt-2 invalid-feedback"/>
      </div>
      <div class="form-floating mb-3">
        <Field name="passwordConfirmation"
               type="password"
               class="form-control"
               placeholder="password"/>
        <label for="passwordConfirmation">{{ $t('register.confirm_password') }}</label>
        <ErrorMessage name="passwordConfirmation" class="d-flex mt-2 invalid-feedback"/>
      </div>
      <button class="btn btn-primary btn-lg w-100 mt-3 px-5">{{ $t('common.sign_up') }}</button>
    </Form>
    <template #note>
      <span>{{ $t('register.have_account') }}</span>
      <router-link class="link-underline link-underline-opacity-0 ps-1" :to="{name: 'login'}">
        {{ $t('common.sign_in') }}
      </router-link>
    </template>
    <div v-if="message"
         class="alert mt-3"
         :class="successful ? 'alert-success' : 'alert-danger'"
    >
      {{ message }}
    </div>
  </AuthPageTemplate>
</template>