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
import {fetchCompanyById} from "@/services/company.service";

const {t} = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore();

const currentUser = computed(() => store.state.auth.user)
const userId = computed(() => route.params.id)
const isOwner = computed(() => currentUser.value.id == userId.value);
const userInfo = computed(() => store.state.users.user);
const invitationList = ref([])
const pendingInvitations = computed(() => {
  return invitationList.value.filter(invitation => invitation.status === 4);
});
const resolvedInvitations = computed(() => {
  return invitationList.value.filter(invitation => invitation.status !== 4);
});
const userCompanies = ref([])
const requestsList = ref([])
const pendingRequests = computed(() => {
  return requestsList.value.filter(request => request.status === 4);
});
const resolvedRequests = computed(() => {
  return requestsList.value.filter(request => request.status !== 4);
});

async function fetchUserInvitations(url) {
  try {
    const response = await apiClient.get(url)

    const {results, next} = response.data
    for (const invitation of results) {
      invitation.company = await fetchCompanyById(invitation.company)
      invitationList.value = [...invitationList.value, invitation];
    }

    if (next) {
      await fetchUserInvitations(next)
    }

  } catch (error) {
    console.error('API Error:', error)
  }
}

async function fetchUserCompanies(url) {
  try {
    const response = await apiClient.get(url)

    const {results, next} = response.data
    userCompanies.value = [...userCompanies.value, ...results]

    if (next) {
      await fetchUserCompanies(next)
    }

  } catch (error) {
    console.error('API Error:', error)
  }
}

async function fetchUserRequests(url) {
  try {
    const response = await apiClient.get(url)

    const {results, next} = response.data
    for (const request of results) {
      request.company = await fetchCompanyById(request.company)
      requestsList.value = [...requestsList.value, request];
    }

    if (next) {
      await fetchUserRequests(next)
    }

  } catch (error) {
    console.error('API Error:', error)
  }
}

const formatDate = (dateString) => {
  const createdAt = new Date(dateString)
  return createdAt.toLocaleDateString()
};

const goToCompanyPage = (companyId) => {
  router.push({name: 'companyProfile', params: {id: companyId}});
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

  if (currentUser.value.id === userInfo.value.id) {
    await fetchUserCompanies('/api/users/me/companies/')
    await fetchUserInvitations('/api/users/me/invitations/')
    await fetchUserRequests('/api/users/me/requests/')
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

// delete user
let deleteUserModal = ref(null);

function showDeleteUserModal() {
  deleteUserModal.value.show();
}

const deleteUserMessage = ref('')
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

// company creation
let createCompanyModal = ref(null);

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

const createCompanyMessage = ref('')
const handleCompanyCreation = async (companyData, actions) => {
  try {
    await apiClient.post(`/api/companies/`, companyData)
    actions.resetForm()
  } catch (err) {
    createCompanyMessage.value = t('company_profile.update_error')
  }
}

// decline invitation
let declineInvitationModal = ref(null);

function showDeclineInvitationModal() {
  declineInvitationModal.value.show();
}

const invitationSchema = yup.object().shape({
  invitation: yup
      .number()
      .required(t('company_profile.invitation_id_required'))
});
const declineInvitationMessage = ref('')
const handleDeclineInvitation = async (invitationData, actions) => {
  try {
    await apiClient.post(`/api/users/me/invitations/${invitationData.invitation}/decline/`, {})
    actions.resetForm()
    declineInvitationMessage.value = ""
  } catch (err) {
    declineInvitationMessage.value = "Error: " + err.response.data.detail
  }
}

// accept invitation
let acceptInvitationModal = ref(null);

function showAcceptInvitationModal() {
  acceptInvitationModal.value.show();
}

const acceptInvitationMessage = ref('')
const handleAcceptInvitation = async (invitationData, actions) => {
  try {
    await apiClient.post(`/api/users/me/invitations/${invitationData.invitation}/accept/`, {})
    actions.resetForm()
    acceptInvitationMessage.value = ""
  } catch (err) {
    acceptInvitationMessage.value = "Error: " + err.response.data.detail
  }
}

// leave company
let leaveCompanyModal = ref(null);

function showLeaveCompanyModal() {
  leaveCompanyModal.value.show();
}

const leaveCompanySchema = yup.object().shape({
  company: yup
      .number()
      .required(t('user_profile.company_id_required'))
});
const leaveCompanyMessage = ref('')
const handleLeaveCompany = async (companyData, actions) => {
  try {
    await apiClient.post(`/api/users/me/companies/${companyData.company}/leave/`, {})
    actions.resetForm()
    leaveCompanyMessage.value = ""
  } catch (err) {
    leaveCompanyMessage.value = "Error: " + err.response.data.detail
  }
}

// create request
let createRequestModal = ref(null);

function showCreateRequestModal() {
  createRequestModal.value.show();
}

const createRequestSchema = yup.object().shape({
  company: yup
      .number()
      .required(t('user_profile.company_id_required'))
});
const createRequestMessage = ref('')
const handleCreateRequest = async (companyData, actions) => {
  try {
    await apiClient.post('/api/users/me/requests/', companyData)
    actions.resetForm()
    createRequestMessage.value = ""
  } catch (err) {
    createRequestMessage.value = "Error: " + JSON.stringify(err.response.data)
  }
}

// cancel request
let cancelRequestModal = ref(null);

function showCancelRequestModal() {
  cancelRequestModal.value.show();
}

const cancelRequestSchema = yup.object().shape({
  request: yup
      .number()
      .required(t('user_profile.request_id_required'))
});
const cancelRequestMessage = ref('')
const handleCancelRequest = async (requestData, actions) => {
  try {
    await apiClient.post(`/api/users/me/requests/${requestData.request}/cancel/`, {})
    actions.resetForm()
    cancelRequestMessage.value = ""
  } catch (err) {
    cancelRequestMessage.value = t('user_profile.requests_cancel_error')
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
          <div class="accordion-item"
               v-if="currentUser.id === userInfo.id">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseUserCompanies"
                      aria-expanded="false"
                      aria-controls="collapseUserCompanies"
              >{{ $t('user_profile.companies') }}
              </button>
            </h2>
            <div id="collapseUserCompanies" class="accordion-collapse collapse" data-bs-parent="#profileAccordion">
              <div class="accordion-body">
                <button class="mb-4 btn btn-danger"
                        type="button"
                        @click="showLeaveCompanyModal"
                >{{ $t('user_profile.leave_company') }}
                </button>
                <Modal ref="leaveCompanyModal"
                       :title="t('user_profile.leave_company')">
                  <Form @submit="handleLeaveCompany"
                        :validation-schema="leaveCompanySchema">
                    <div class="form-floating mb-3">
                      <Field name="company"
                             type="number"
                             class="form-control"
                             placeholder="Company"/>
                      <label for="company">{{ $t('user_profile.company_id') }}</label>
                      <ErrorMessage name="company" class="d-flex mt-2 invalid-feedback"/>
                    </div>
                    <button class="d-flex btn btn-danger px-3 ms-auto">{{ $t('user_profile.leave_company') }}</button>
                  </Form>
                  <div v-if="leaveCompanyMessage"
                       class="alert mt-3 alert-danger"
                  >
                    {{ leaveCompanyMessage }}
                  </div>
                </Modal>
                <h4>{{ $t('user_profile.user_companies') }}:</h4>
                <table class="table table-striped table-hover mb-5">
                  <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(company) in userCompanies"
                      :key="company.id"
                      @click="goToCompanyPage(company.id)">
                    <th scope="row">{{ company.id }}</th>
                    <td>{{ company.name }}</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="accordion-item"
               v-if="currentUser.id === userInfo.id">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseUserInvitations"
                      aria-expanded="false"
                      aria-controls="collapseUserInvitations"
              >{{ $t('company_profile.invitations') }}
              </button>
            </h2>
            <div id="collapseUserInvitations" class="accordion-collapse collapse" data-bs-parent="#profileAccordion">
              <div class="accordion-body">
                <button class="mb-4 btn btn-primary"
                        type="button"
                        @click="showAcceptInvitationModal"
                >{{ $t('user_profile.accept_invitation') }}
                </button>
                <Modal ref="acceptInvitationModal"
                       :title="t('user_profile.accept_invitation')">
                  <Form @submit="handleAcceptInvitation"
                        :validation-schema="invitationSchema">
                    <div class="form-floating mb-3">
                      <Field name="invitation"
                             type="number"
                             class="form-control"
                             placeholder="Invitation"/>
                      <label for="invitation">{{ $t('company_profile.invitation_id') }}</label>
                      <ErrorMessage name="invitation" class="d-flex mt-2 invalid-feedback"/>
                    </div>
                    <button class="d-flex btn btn-danger px-3 ms-auto">{{ $t('company_profile.revoke') }}</button>
                  </Form>
                  <div v-if="acceptInvitationMessage"
                       class="alert mt-3 alert-danger"
                  >
                    {{ acceptInvitationMessage }}
                  </div>
                </Modal>
                <button class="ms-2 mb-4 btn btn-danger"
                        type="button"
                        @click="showDeclineInvitationModal"
                >{{ $t('user_profile.decline_invitation') }}
                </button>
                <Modal ref="declineInvitationModal"
                       :title="t('user_profile.decline_invitation')">
                  <Form @submit="handleDeclineInvitation"
                        :validation-schema="invitationSchema">
                    <div class="form-floating mb-3">
                      <Field name="invitation"
                             type="number"
                             class="form-control"
                             placeholder="Invitation"/>
                      <label for="invitation">{{ $t('company_profile.invitation_id') }}</label>
                      <ErrorMessage name="invitation" class="d-flex mt-2 invalid-feedback"/>
                    </div>
                    <button class="d-flex btn btn-danger px-3 ms-auto">{{ $t('company_profile.revoke') }}</button>
                  </Form>
                  <div v-if="declineInvitationMessage"
                       class="alert mt-3 alert-danger"
                  >
                    {{ declineInvitationMessage }}
                  </div>
                </Modal>
                <h4>{{ $t('company_profile.pending_invitations') }}:</h4>
                <table class="table table-striped table-hover mb-5">
                  <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Company</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(invitation) in pendingInvitations"
                      :key="invitation.id"
                      @click="goToCompanyPage(invitation.company.id)">
                    <th scope="row">{{ invitation.id }}</th>
                    <td>{{ invitation.company.name }}</td>
                  </tr>
                  </tbody>
                </table>
                <h4>{{ $t('company_profile.resolved_invitations') }}:</h4>
                <table class="table table-striped table-hover">
                  <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Company</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(invitation) in resolvedInvitations"
                      :key="invitation.id"
                      @click="goToCompanyPage(invitation.company.id)">
                    <th scope="row">{{ invitation.id }}</th>
                    <td>{{ invitation.company.name }}</td>
                    <td>{{
                        invitation.status === 1 ? t('company_profile.accepted') :
                            (invitation.status === 2 ? t('company_profile.declined') : t('company_profile.revoked'))
                      }}
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="accordion-item"
               v-if="currentUser.id === userInfo.id">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseUserRequests"
                      aria-expanded="false"
                      aria-controls="collapseUserRequests"
              >{{ $t('company_profile.requests') }}
              </button>
            </h2>
            <div id="collapseUserRequests" class="accordion-collapse collapse" data-bs-parent="#profileAccordion">
              <div class="accordion-body">
                <button class="mb-4 btn btn-primary"
                        type="button"
                        @click="showCreateRequestModal"
                >{{ $t('user_profile.create_request') }}
                </button>
                <Modal ref="createRequestModal"
                       :title="t('user_profile.create_request')">
                  <Form @submit="handleCreateRequest"
                        :validation-schema="createRequestSchema">
                    <div class="form-floating mb-3">
                      <Field name="company"
                             type="number"
                             class="form-control"
                             placeholder="Invitation"/>
                      <label for="company">{{ $t('user_profile.company_id') }}</label>
                      <ErrorMessage name="company" class="d-flex mt-2 invalid-feedback"/>
                    </div>
                    <button class="d-flex btn btn-primary px-3 ms-auto">{{ $t('user_profile.create_request') }}</button>
                  </Form>
                  <div v-if="createRequestMessage"
                       class="alert mt-3 alert-danger"
                  >
                    {{ createRequestMessage }}
                  </div>
                </Modal>
                <button class="ms-2 mb-4 btn btn-danger"
                        type="button"
                        @click="showCancelRequestModal"
                >{{ $t('user_profile.cancel_request') }}
                </button>
                <Modal ref="cancelRequestModal"
                       :title="t('user_profile.cancel_request')">
                  <Form @submit="handleCancelRequest"
                        :validation-schema="cancelRequestSchema">
                    <div class="form-floating mb-3">
                      <Field name="request"
                             type="number"
                             class="form-control"
                             placeholder="Invitation"/>
                      <label for="request">{{ $t('user_profile.request_id') }}</label>
                      <ErrorMessage name="request" class="d-flex mt-2 invalid-feedback"/>
                    </div>
                    <button class="d-flex btn btn-danger px-3 ms-auto">{{ $t('user_profile.cancel_request') }}</button>
                  </Form>
                  <div v-if="cancelRequestMessage"
                       class="alert mt-3 alert-danger"
                  >
                    {{ cancelRequestMessage }}
                  </div>
                </Modal>
                <h4>{{ $t('company_profile.pending_requests') }}:</h4>
                <table class="table table-striped table-hover mb-5">
                  <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Company</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(request) in pendingRequests"
                      :key="request.id"
                      @click="goToCompanyPage(request.company.id)">
                    <th scope="row">{{ request.id }}</th>
                    <td>{{ request.company.name }}</td>
                  </tr>
                  </tbody>
                </table>
                <h4>{{ $t('company_profile.resolved_requests') }}:</h4>
                <table class="table table-striped table-hover">
                  <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Company</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(request) in resolvedRequests"
                      :key="request.id"
                      @click="goToCompanyPage(request.company.id)">
                    <th scope="row">{{ request.id }}</th>
                    <td>{{ request.company.name }}</td>
                    <td>{{
                        request.status === 1 ? t('company_profile.approved') :
                            (request.status === 2 ? t('company_profile.rejected') : t('company_profile.cancelled'))
                      }}
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div v-if="currentUser.id === userInfo.id">
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
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
tr {
  cursor: pointer;
}
</style>