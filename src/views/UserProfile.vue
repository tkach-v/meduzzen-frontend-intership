<script setup>
import {computed, onMounted, ref} from 'vue';
import {useStore} from 'vuex';
import {useRoute, useRouter} from "vue-router";
import i18n from "@/i18n/index"
import {ErrorMessage, Field, Form} from "vee-validate";
import * as yup from "yup";
import {useI18n} from "vue-i18n";
import apiClient from "@/http/axios/apiClient";
import Modal from "@/components/Modal.vue";

const {t} = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore();

const currentUser = computed(() => store.state.auth.user)
const userId = computed(() => route.params.id)
const isOwner = computed(() => currentUser.value.id == userId.value);
const userInfo = computed(() => store.state.users.user);

const formatDate = (dateString) => {
  const createdAt = new Date(dateString)
  return createdAt.toLocaleDateString()
};

onMounted(() => {
  if (userId.value && isOwner.value) {
    router.push({name: 'profile', params: {locale: i18n.global.locale.value}})
  }

  if (userId.value) {
    store.dispatch('users/fetchUserById', userId.value)
  } else {
    store.dispatch('users/fetchUserById', currentUser.value.id)
  }
});

// updating user info form schema and onSubmit method
const userInfoSchema = yup.object().shape({
  firstName: yup
      .string()
      .required(t('user_profile.first_name_required'))
      .max(50, t('user_profile.name_large')),
  lastName: yup
      .string()
      .required(t('user_profile.last_name_required'))
      .max(50, t('user_profile.name_large')),
});

const changeInfoMessage = ref('');
const handleChangeInfo = async (userData, actions) => {
  try {
    const data = {
      "first_name": userData.firstName,
      "last_name": userData.lastName,
    }
    await apiClient.patch(`/api/users/${userInfo.value.id}/`, data)
    await store.dispatch('users/fetchUserById', userInfo.value.id)
    actions.resetForm()
  } catch (err) {
    changeInfoMessage.value = t('user_profile.update_error')
  }
};

// changing user password form schema and onSubmit method
const changePasswordSchema = yup.object().shape({
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

const changePasswordMessage = ref('');
const handleChangePassword = async (userData) => {
  try {
    const data = {
      "password": userData.password,
    }
    await apiClient.patch(`/api/users/${userInfo.value.id}/`, data)
    store.dispatch('auth/logout').then(() => {
      router.push({name: 'login', params: {locale: i18n.global.locale.value}});
    });
  } catch (err) {
    changePasswordMessage.value = t('user_profile.update_error')
  }
};

// changing user avatar form schema and onSubmit method
const validFileExtensions = {image: ['jpg', 'gif', 'png', 'jpeg', 'svg', 'webp']};

function isValidFileType(fileName, fileType) {
  return fileName && validFileExtensions[fileType].indexOf(fileName.split('.').pop()) > -1;
}

const changeAvatarSchema = yup.object().shape({
  image: yup
      .mixed()
      .required(t('user_profile.avatar_required'))
      .test("is-valid-type", t('user_profile.avatar_invalid_type'),
          value => isValidFileType(value && value.name.toLowerCase(), "image"))
      .test("is-valid-size", t('user_profile.avatar_invalid_size'),
          value => value && value.size <= 1048576)
});

const changeAvatarMessage = ref('');
const handleChangeAvatar = async (userData) => {
  try {
    const data = {
      "avatar": userData.image
    }

    apiClient.interceptors.request.use(
        (config) => {
          config.headers["Content-Type"] = 'multipart/form-data'
          return config;
        }
    );
    await apiClient.patch(`/api/users/${userInfo.value.id}/`, data)
    await store.dispatch('users/fetchUserById', userInfo.value.id)
  } catch (err) {
    changeAvatarMessage.value = t('user_profile.update_error')
  }
};

let deleteUserModal = ref(null);

function showDeleteUserModal() {
  deleteUserModal.value.show();
}

const deleteUserMessage = ref('')
const handleDeleteUser = async ({password}) => {
  try {
    await apiClient.delete(`/api/users/delete/${userInfo.value.id}/`)
    store.dispatch('auth/logout').then(() => {
      router.push({name: 'home', params: {locale: i18n.global.locale.value}});
    });
  } catch (err) {
    deleteUserMessage.value = t('user_profile.update_error')
  }
}
</script>

<template>
  <div v-if="currentUser" class="container mt-5">
    <div class="card">
      <div class="card-body">
        <div class="d-flex gap-5">
          <div>
            <img class="border border-2" :src="userInfo.avatar" alt="User Avatar"
                 style="width: 150px; height: 150px; object-fit: cover">
          </div>
          <div class="col d-flex flex-column flex-sm-row justify-content-between">
            <div class="d-flex flex-column">
              <h4 class="mb-0">{{ userInfo.email }}</h4>
              <p class="pt-sm-2 pb-1 mb-0 text-nowrap">{{ userInfo.first_name }} {{ userInfo.last_name }}</p>
              <div class="mt-auto pt-4"
                   v-if="currentUser.id === userInfo.id">
                <div>{{ $t('user_profile.change_avatar') }}:</div>
                <Form @submit="handleChangeAvatar"
                      :validation-schema="changeAvatarSchema"
                      enctype="multipart/form-data">
                  <Field name="image"
                         type="file"
                         class="form-control my-2"/>
                  <ErrorMessage name="image" class="d-flex my-2 invalid-feedback"/>
                  <button class="btn btn-primary px-2">{{ $t('user_profile.save') }}</button>
                </Form>
                <div v-if="changeAvatarMessage"
                     class="alert mt-3 alert-danger"
                >
                  {{ changeAvatarMessage }}
                </div>
              </div>
            </div>
            <div class="text-center text-sm-right">
              <div class="text-muted">{{ $t('user_profile.joined') }} {{ formatDate(userInfo.created_at) }}</div>
            </div>
          </div>
        </div>
        <div class="accordion mt-5" id="profileAccordion">
          <div class="accordion-item"
               v-if="currentUser.id === userInfo.id">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseChangeInfo"
                      aria-expanded="false"
                      aria-controls="collapseChangeInfo"
              >{{ $t('user_profile.change_user_info') }}
              </button>
            </h2>
            <div id="collapseChangeInfo" class="accordion-collapse collapse" data-bs-parent="#profileAccordion">
              <div class="accordion-body">
                <Form @submit="handleChangeInfo" :validation-schema="userInfoSchema">
                  <div class="form-floating mb-3">
                    <input name="email"
                           type="email"
                           class="form-control"
                           placeholder="user@example.com"
                           :value="userInfo.email"
                           readonly/>
                    <label for="email">{{ $t('common.email') }}</label>
                  </div>
                  <div class="form-floating mb-3">
                    <Field
                        name="firstName"
                        type="text"
                        class="form-control"
                        placeholder="First Name"/>
                    <label for="firstName">{{ $t('user_profile.first_name') }}</label>
                    <ErrorMessage name="firstName" class="d-flex mt-2 invalid-feedback"/>
                  </div>
                  <div class="form-floating mb-3">
                    <Field name="lastName"
                           type="text"
                           class="form-control"
                           placeholder="Last Name"/>
                    <label for="lastName">{{ $t('user_profile.last_name') }}</label>
                    <ErrorMessage name="lastName" class="d-flex mt-2 invalid-feedback"/>
                  </div>
                  <button class="d-flex btn btn-primary px-3 ms-auto">{{ $t('user_profile.save') }}</button>
                </Form>
                <div v-if="changeInfoMessage"
                     class="alert mt-3 alert-danger"
                >
                  {{ changeInfoMessage }}
                </div>
              </div>
            </div>
          </div>
          <div class="accordion-item"
               v-if="currentUser.id === userInfo.id">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseChangePass"
                      aria-expanded="false"
                      aria-controls="collapseChangePass"
              >{{ $t('user_profile.change_user_password') }}
              </button>
            </h2>
            <div id="collapseChangePass" class="accordion-collapse collapse" data-bs-parent="#profileAccordion">
              <div class="accordion-body">
                <Form @submit="handleChangePassword" :validation-schema="changePasswordSchema">
                  <div class="form-floating mb-3">
                    <Field
                        name="password"
                        type="password"
                        class="form-control"
                        placeholder="password"/>
                    <label for="password">{{ $t('user_profile.new_password') }}</label>
                    <ErrorMessage name="password" class="d-flex mt-2 invalid-feedback"/>
                  </div>
                  <div class="form-floating mb-3">
                    <Field name="passwordConfirmation"
                           type="password"
                           class="form-control"
                           placeholder="password"/>
                    <label for="passwordConfirmation">{{ $t('user_profile.new_password_confirm') }}</label>
                    <ErrorMessage name="passwordConfirmation" class="d-flex mt-2 invalid-feedback"/>
                  </div>
                  <button class="d-flex btn btn-primary px-3 ms-auto">{{ $t('user_profile.save') }}</button>
                </Form>
                <div v-if="changePasswordMessage"
                     class="alert mt-3 alert-danger"
                >
                  {{ changePasswordMessage }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <button v-if="currentUser.id === userInfo.id"
                class="mt-4 btn btn-danger"
                type="button"
                @click="showDeleteUserModal"
        >{{ $t('user_profile.delete_user') }}
        </button>
        <Modal v-if="currentUser.id === userInfo.id"
               ref="deleteUserModal"
               :title="t('user_profile.delete_user')">
          <p>{{ $t('user_profile.delete_user_confirm') }}</p>
          <div class="d-flex gap-2 justify-content-end">
            <button class="btn btn-secondary"
                    data-bs-dismiss="modal"
                    aria-label="Close"
            >{{ $t('common.cancel') }}
            </button>
            <button class="btn btn-danger"
                    data-bs-dismiss="modal"
                    @click="handleDeleteUser"
            >{{ $t('user_profile.delete_user') }}
            </button>
          </div>
          <div v-if="deleteUserMessage"
               class="alert mt-3 alert-danger"
          >
            {{ deleteUserMessage }}
          </div>
        </Modal>
      </div>
    </div>
  </div>
</template>