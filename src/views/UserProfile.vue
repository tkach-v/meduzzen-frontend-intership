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
import AccordionItem from "@/components/AccordionItem.vue";
import UserInvitations from "@/components/UserInvitations.vue";
import UserRequests from "@/components/UserRequests.vue";
import UserCompanies from "@/components/UserCompanies.vue";
import UserQuizzes from "@/components/UserQuizzes.vue";
import {getUserRating} from "@/services/users.service";
import VueStarRating from 'vue-star-rating'
import UserAnalytics from "@/components/UserAnalytics.vue";

const {t} = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore();

const changeInfoMessage = ref('');
const changePasswordMessage = ref('');
const changeAvatarMessage = ref('');
const deleteUserModal = ref(null);
const deleteUserMessage = ref('')
const createCompanyModal = ref(null);
const createCompanyMessage = ref('')
const userScore = ref(0)

const validFileExtensions = {image: ['jpg', 'gif', 'png', 'jpeg', 'svg', 'webp']};

const currentUser = computed(() => store.state.auth.user)
const userId = computed(() => route.params.id)
const isOwner = computed(() => currentUser.value.id == userId.value);
const userInfo = computed(() => store.state.users.user);

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


function isValidFileType(fileName, fileType) {
  const isValidFileExtention = validFileExtensions[fileType].indexOf(fileName.split('.').pop()) > -1
  return fileName && isValidFileExtention;
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

function showDeleteUserModal() {
  deleteUserModal.value.show();
}

const handleDeleteUser = async () => {
  try {
    await apiClient.delete(`/api/users/delete/${userInfo.value.id}/`)
    store.dispatch('auth/logout').then(() => {
      router.push({name: 'home', params: {locale: i18n.global.locale.value}});
    });
  } catch (err) {
    deleteUserMessage.value = t('user_profile.update_error')
  }
}

function showCreateCompanyModal() {
  createCompanyModal.value.show();
}

const createCompanySchema = yup.object().shape({
  name: yup
      .string()
      .required(t('company_profile.name_required')),
  description: yup
      .string()
      .required(t('company_profile.description_required'))
});

const handleCompanyCreation = async (companyData, actions) => {
  try {
    await apiClient.post(`/api/companies/`, companyData)
    actions.resetForm()
  } catch (err) {
    createCompanyMessage.value = t('company_profile.update_error')
  }
}

const formatDate = (dateString) => {
  const createdAt = new Date(dateString)
  return createdAt.toLocaleDateString()
};

onMounted(async () => {
  if (userId.value && isOwner.value) {
    await router.push({name: 'profile', params: {locale: i18n.global.locale.value}})
  }

  if (userId.value) {
    await store.dispatch('users/fetchUserById', userId.value)
  } else {
    await store.dispatch('users/fetchUserById', currentUser.value.id)
  }
  userScore.value = await getUserRating(userInfo.value.id)
});
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
              <div class="d-flex align-items-center gap-3">
                <b>{{ $t('user_profile.average_score') }}: </b>
                <VueStarRating :rating="userScore * 5"
                               :read-only="true"
                               :increment="0.01"
                               :star-size="25"
                ></VueStarRating>
              </div>
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
        <template v-if="currentUser.id === userInfo.id">
          <div class="accordion mt-5" id="profileAccordion">
            <AccordionItem
                :itemTitle="t('user_profile.change_user_info')"
                itemSuffix="ChangeInfo"
                parentSelector="#profileAccordion"
            >
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
            </AccordionItem>
            <AccordionItem
                :itemTitle="t('user_profile.change_user_password')"
                itemSuffix="ChangePass"
                parentSelector="#profileAccordion"
            >
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
            </AccordionItem>
            <AccordionItem
                :itemTitle="t('user_profile.companies')"
                itemSuffix="UserCompanies"
                parentSelector="#profileAccordion"
            >
              <UserCompanies/>
            </AccordionItem>
            <AccordionItem
                :itemTitle="t('company_profile.invitations')"
                itemSuffix="UserInvitations"
                parentSelector="#profileAccordion"
            >
              <UserInvitations/>
            </AccordionItem>
            <AccordionItem
                :itemTitle="t('company_profile.requests')"
                itemSuffix="UserRequests"
                parentSelector="#profileAccordion"
            >
              <UserRequests/>
            </AccordionItem>
            <AccordionItem
                :itemTitle="t('company_profile.quizzes')"
                itemSuffix="UserQuizzes"
                parentSelector="#profileAccordion"
            >
              <UserQuizzes :userId="currentUser.id"/>
            </AccordionItem>
            <AccordionItem
                :itemTitle="t('company_profile.analytics')"
                itemSuffix="UserAnalytics"
                parentSelector="#profileAccordion"
            >
              <UserAnalytics :userId="currentUser.id"/>
            </AccordionItem>
          </div>
          <div>
            <button class="mt-4 btn btn-primary me-2"
                    type="button"
                    @click="showCreateCompanyModal"
            >{{ $t('user_profile.create_company') }}
            </button>
            <button class="mt-4 btn btn-danger"
                    type="button"
                    @click="showDeleteUserModal"
            >{{ $t('user_profile.delete_user') }}
            </button>
            <Modal ref="deleteUserModal"
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
            <Modal ref="createCompanyModal"
                   :title="t('user_profile.create_company')">
              <Form @submit="handleCompanyCreation" :validation-schema="createCompanySchema">
                <div class="form-floating mb-3">
                  <Field name="name"
                         type="text"
                         class="form-control"
                         placeholder="user@example.com"/>
                  <label for="name">{{ $t('company_profile.name') }}</label>
                  <ErrorMessage name="name" class="d-flex mt-2 invalid-feedback"/>
                </div>
                <div class="form-floating mb-3">
                  <Field
                      name="description"
                      as="textarea"
                      type="text"
                      class="form-control"
                      placeholder="Description"
                      style="height: 125px"/>
                  <label for="description">{{ $t('company_profile.description') }}</label>
                  <ErrorMessage name="description" class="d-flex mt-2 invalid-feedback"/>
                </div>
                <button class="btn btn-primary btn-lg w-100 mt-3 px-5">{{ $t('common.create') }}</button>
              </Form>
              <div v-if="createCompanyMessage"
                   class="alert mt-3 alert-danger"
              >
                {{ createCompanyMessage }}
              </div>
            </Modal>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>