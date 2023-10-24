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
import {fetchUserById} from "@/services/users.service";
import { fetchCompanyById as customFetchCompanyById } from "@/services/company.service";

const {t} = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore();

const currentUser = computed(() => store.state.auth.user)
const isOwner = computed(() => currentUser.value.id === companyInfo.value.owner)
const isMember = computed(() => companyInfo.value.members && companyInfo.value.members.includes(currentUser.value.id))
const companyInfo = ref({})
const membersList = ref([])
const invitationList = ref([])
const pendingInvitations = computed(() => {
  return invitationList.value.filter(invitation => invitation.status === 4);
});
const resolvedInvitations = computed(() => {
  return invitationList.value.filter(invitation => invitation.status !== 4);
});
const requestsList = ref([])
const pendingRequests = computed(() => {
  return requestsList.value.filter(request => request.status === 4);
});
const resolvedRequests = computed(() => {
  return requestsList.value.filter(request => request.status !== 4);
});

async function fetchCompanyById(companyId) {
  try {
    const {data} = await apiClient.get(`/api/companies/${companyId}/`);
    companyInfo.value = data
  } catch (error) {
    console.error('API Error:', error)
  }
}

async function fetchCompanyMembers() {
  try {
    const members = [];
    for (const member of companyInfo.value.members) {
      members.push(await fetchUserById(member))
    }
    membersList.value = members;
  } catch (error) {
    console.error('API Error:', error)
  }
}

async function fetchCompanyInvitations(url) {
  try {
    const response = await apiClient.get(url)

    const {results, next} = response.data
    for (const invitation of results) {
      invitation.recipient = await fetchUserById(invitation.recipient)
      invitationList.value = [...invitationList.value, invitation];
    }

    if (next) {
      await fetchCompanyInvitations(next)
    }

  } catch (error) {
    console.error('API Error:', error)
  }
}

async function fetchCompanyRequests(url) {
  try {
    const response = await apiClient.get(url)

    const {results, next} = response.data
    for (const request of results) {
      request.company = await customFetchCompanyById(request.company)
      requestsList.value = [...requestsList.value, request];
    }

    if (next) {
      await fetchCompanyRequests(next)
    }

  } catch (error) {
    console.error('API Error:', error)
  }
}


onMounted(async () => {
  await fetchCompanyById(route.params.id)
  await fetchCompanyMembers()

  if (isOwner.value) {
    await fetchCompanyInvitations(`/api/companies/${companyInfo.value.id}/invitations/`)
    await fetchCompanyRequests(`/api/companies/${companyInfo.value.id}/requests/`)
  }
});

const formatDate = (dateString) => {
  const createdAt = new Date(dateString)
  return createdAt.toLocaleDateString()
};

const goToUserPage = (userId) => {
  router.push({name: 'userProfile', params: {id: userId}});
};

// delete company
let deleteCompanyModal = ref(null);

function showDeleteCompanyModal() {
  deleteCompanyModal.value.show();
}

const deleteCompanyMessage = ref('')
const handleDeleteCompany = async () => {
  try {
    await apiClient.delete(`/api/companies/${companyInfo.value.id}/`)
    await router.push({name: 'companiesList', params: {locale: i18n.global.locale.value}});
  } catch (err) {
    deleteCompanyMessage.value = t('user_profile.update_error')
  }
}

// updating company info form schema and onSubmit method
const companyInfoSchema = yup.object().shape({
  name: yup
      .string()
      .required(t('company_profile.name_required')),
  description: yup
      .string()
      .required(t('company_profile.description_required'))
});

const changeInfoMessage = ref('');
const handleChangeInfo = async (companyData, actions) => {
  try {
    await apiClient.patch(`/api/companies/${companyInfo.value.id}/`, companyData)
    await fetchCompanyById(companyInfo.value.id)
    actions.resetForm()
  } catch (err) {
    changeInfoMessage.value = t('user_profile.company_create_error')
  }
};

// create invitation
let createInvitationModal = ref(null);

function showCreateInvitationModal() {
  createInvitationModal.value.show();
}

const createInvitationSchema = yup.object().shape({
  recipient: yup
      .number()
      .required(t('company_profile.recipient_id_required'))
});
const createInvitationMessage = ref('')
const handleCreateInvitation = async (recipientData, actions) => {
  try {
    await apiClient.post(`/api/companies/${companyInfo.value.id}/invitations/`, recipientData)
    actions.resetForm()
    createInvitationMessage.value = ""
  } catch (err) {
    createInvitationMessage.value = "Error: " + JSON.stringify(err.response.data)
  }
}

// revoke invitation
let revokeInvitationModal = ref(null);

function showRevokeInvitationModal() {
  revokeInvitationModal.value.show();
}

const revokeInvitationSchema = yup.object().shape({
  invitation: yup
      .number()
      .required(t('company_profile.invitation_id_required'))
});
const revokeInvitationMessage = ref('')
const handleRevokeInvitation = async (invitationData, actions) => {
  try {
    await apiClient.post(`/api/companies/${companyInfo.value.id}/invitations/${invitationData.invitation}/revoke/`, {})
    actions.resetForm()
    revokeInvitationMessage.value = ""
  } catch (err) {
    revokeInvitationMessage.value = t('company_profile.revoke_error')
  }
}

// remove user
let removeUserModal = ref(null);

function showRemoveUserModal() {
  removeUserModal.value.show();
}

const removeUserSchema = yup.object().shape({
  user_id: yup
      .number()
      .required(t('company_profile.user_id_required'))
});
const removeUserMessage = ref('')
const handleRemoveUser = async (userData, actions) => {
  try {
    await apiClient.post(`/api/companies/${companyInfo.value.id}/remove-user/`, userData)
    actions.resetForm()
    removeUserMessage.value = ""
  } catch (err) {
    removeUserMessage.value = "Error: " + err.response.data.detail
  }
}

// approve request
let approveRequestModal = ref(null);

function showApproveRequestModal() {
  approveRequestModal.value.show();
}

const requestSchema = yup.object().shape({
  request: yup
      .number()
      .required(t('user_profile.request_id_required'))
});
const approveRequestMessage = ref('')
const handleApproveRequest = async (requestData, actions) => {
  try {
    await apiClient.post(`/api/companies/${companyInfo.value.id}/requests/${requestData.request}/approve/`, {})
    actions.resetForm()
    approveRequestMessage.value = ""
  } catch (err) {
    approveRequestMessage.value = "Error: " + JSON.stringify(err.response.data.detail)
  }
}

// reject request
let rejectRequestModal = ref(null);

function showRejectRequestModal() {
  rejectRequestModal.value.show();
}

const rejectRequestMessage = ref('')
const handleRejectRequest = async (requestData, actions) => {
  try {
    await apiClient.post(`/api/companies/${companyInfo.value.id}/requests/${requestData.request}/reject/`, {})
    actions.resetForm()
    rejectRequestMessage.value = ""
  } catch (err) {
    approveRequestMessage.value = "Error: " + JSON.stringify(err.response.data.detail)
  }
}
</script>

<template>
  <div v-if="currentUser" class="container mt-5">
    <div class="card">
      <div class="card-body">
        <div>
          <h4 class="mb-3">{{ companyInfo.name }}</h4>
          <div class="alert alert-info py-2 mb-3" role="alert">
            <template v-if="isOwner">{{ $t('company_profile.user_owner') }}</template>
            <template v-else-if="isMember">{{ $t('company_profile.user_member') }}</template>
            <template v-else>{{ $t('company_profile.user_not_member') }}</template>
          </div>
          <p class="mb-2"
             style="white-space: pre-line">
            <b>{{ $t('company_profile.description') }}: </b>{{ companyInfo.description }}
          </p>
          <p class="mb-2"><b>{{ $t('company_profile.created_at') }}: </b>{{ formatDate(companyInfo.created_at) }}</p>
        </div>
        <div class="accordion mt-4" id="profileAccordion">
          <div class="accordion-item"
               v-if="isOwner">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseChangeInfo"
                      aria-expanded="false"
                      aria-controls="collapseChangeInfo"
              >{{ $t('company_profile.change_info') }}
              </button>
            </h2>
            <div id="collapseChangeInfo" class="accordion-collapse collapse" data-bs-parent="#profileAccordion">
              <div class="accordion-body">
                <Form @submit="handleChangeInfo" :validation-schema="companyInfoSchema">
                  <div class="form-floating mb-3">
                    <Field
                        name="name"
                        type="text"
                        class="form-control"
                        placeholder="Name"/>
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
                  <button class="d-flex btn btn-primary px-3 ms-auto">{{ $t('common.save') }}</button>
                </Form>
                <div v-if="changeInfoMessage"
                     class="alert mt-3 alert-danger"
                >
                  {{ changeInfoMessage }}
                </div>
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseMembers"
                      aria-expanded="false"
                      aria-controls="collapseMembers"
              >{{ $t('company_profile.members') }}
              </button>
            </h2>
            <div id="collapseMembers" class="accordion-collapse collapse" data-bs-parent="#profileAccordion">
              <div class="accordion-body">
                <div v-if="isOwner">
                  <button class="mb-4 btn btn-danger"
                          type="button"
                          @click="showRemoveUserModal"
                  >{{ $t('company_profile.remove_member') }}
                  </button>
                  <Modal ref="removeUserModal"
                         :title="t('company_profile.remove_member')">
                    <Form @submit="handleRemoveUser"
                          :validation-schema="removeUserSchema">
                      <div class="form-floating mb-3">
                        <Field name="user_id"
                               type="number"
                               class="form-control"
                               placeholder="Recipient"/>
                        <label for="user_id">{{ $t('company_profile.user_id') }}</label>
                        <ErrorMessage name="user_id" class="d-flex mt-2 invalid-feedback"/>
                      </div>
                      <button class="d-flex btn btn-danger px-3 ms-auto">{{
                          $t('company_profile.remove_member')
                        }}
                      </button>
                    </Form>
                    <div v-if="removeUserMessage"
                         class="alert mt-3 alert-danger"
                    >
                      {{ removeUserMessage }}
                    </div>
                  </Modal>
                </div>
                <table class="table table-striped table-hover">
                  <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Email</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(user) in membersList"
                      :key="user.id"
                      @click="goToUserPage(user.id)">
                    <th scope="row">{{ user.id }}</th>
                    <td>{{ user.email }}</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="accordion-item"
               v-if="isOwner">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseInvitations"
                      aria-expanded="false"
                      aria-controls="collapseInvitations"
              >{{ $t('company_profile.invitations') }}
              </button>
            </h2>
            <div id="collapseInvitations" class="accordion-collapse collapse" data-bs-parent="#profileAccordion">
              <div class="accordion-body">
                <button class="mb-4 btn btn-primary"
                        type="button"
                        @click="showCreateInvitationModal"
                >{{ $t('company_profile.create_invitation') }}
                </button>
                <Modal ref="createInvitationModal"
                       :title="t('company_profile.create_invitation')">
                  <Form @submit="handleCreateInvitation"
                        :validation-schema="createInvitationSchema">
                    <div class="form-floating mb-3">
                      <Field name="recipient"
                             type="number"
                             class="form-control"
                             placeholder="Recipient"/>
                      <label for="recipient">{{ $t('company_profile.recipient_id') }}</label>
                      <ErrorMessage name="recipient" class="d-flex mt-2 invalid-feedback"/>
                    </div>
                    <button class="d-flex btn btn-primary px-3 ms-auto">{{ $t('common.create') }}</button>
                  </Form>
                  <div v-if="createInvitationMessage"
                       class="alert mt-3 alert-danger"
                  >
                    {{ createInvitationMessage }}
                  </div>
                </Modal>
                <button class="ms-2 mb-4 btn btn-danger"
                        type="button"
                        @click="showRevokeInvitationModal"
                >{{ $t('company_profile.revoke_invitation') }}
                </button>
                <Modal ref="revokeInvitationModal"
                       :title="t('company_profile.create_invitation')">
                  <Form @submit="handleRevokeInvitation"
                        :validation-schema="revokeInvitationSchema">
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
                  <div v-if="revokeInvitationMessage"
                       class="alert mt-3 alert-danger"
                  >
                    {{ revokeInvitationMessage }}
                  </div>
                </Modal>
                <h4>{{ $t('company_profile.pending_invitations') }}:</h4>
                <table class="table table-striped table-hover mb-5">
                  <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Email</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(invitation) in pendingInvitations"
                      :key="invitation.id"
                      @click="goToUserPage(invitation.recipient.id)">
                    <th scope="row">{{ invitation.id }}</th>
                    <td>{{ invitation.recipient.email }}</td>
                  </tr>
                  </tbody>
                </table>
                <h4>{{ $t('company_profile.resolved_invitations') }}:</h4>
                <table class="table table-striped table-hover">
                  <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Email</th>
                    <th scope="col">Status</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(invitation) in resolvedInvitations"
                      :key="invitation.id"
                      @click="goToUserPage(invitation.recipient.id)">
                    <th scope="row">{{ invitation.id }}</th>
                    <td>{{ invitation.recipient.email }}</td>
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
               v-if="isOwner">
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
                        @click="showApproveRequestModal"
                >{{ $t('company_profile.approve_request') }}
                </button>
                <Modal ref="approveRequestModal"
                       :title="t('company_profile.approve_request')">
                  <Form @submit="handleApproveRequest"
                        :validation-schema="requestSchema">
                    <div class="form-floating mb-3">
                      <Field name="request"
                             type="number"
                             class="form-control"
                             placeholder="Invitation"/>
                      <label for="request">{{ $t('user_profile.request_id') }}</label>
                      <ErrorMessage name="request" class="d-flex mt-2 invalid-feedback"/>
                    </div>
                    <button class="d-flex btn btn-primary px-3 ms-auto">{{ $t('company_profile.approve_request') }}</button>
                  </Form>
                  <div v-if="approveRequestMessage"
                       class="alert mt-3 alert-danger"
                  >
                    {{ approveRequestMessage }}
                  </div>
                </Modal>
                <button class="ms-2 mb-4 btn btn-danger"
                        type="button"
                        @click="showRejectRequestModal"
                >{{ $t('company_profile.reject_request') }}
                </button>
                <Modal ref="rejectRequestModal"
                       :title="t('company_profile.reject_request')">
                  <Form @submit="handleRejectRequest"
                        :validation-schema="requestSchema">
                    <div class="form-floating mb-3">
                      <Field name="request"
                             type="number"
                             class="form-control"
                             placeholder="Invitation"/>
                      <label for="request">{{ $t('user_profile.request_id') }}</label>
                      <ErrorMessage name="request" class="d-flex mt-2 invalid-feedback"/>
                    </div>
                    <button class="d-flex btn btn-danger px-3 ms-auto">{{ $t('company_profile.reject_request') }}</button>
                  </Form>
                  <div v-if="rejectRequestMessage"
                       class="alert mt-3 alert-danger"
                  >
                    {{ rejectRequestMessage }}
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
        <div v-if="isOwner">
          <button class="mt-4 btn btn-danger"
                  type="button"
                  @click="showDeleteCompanyModal"
          >{{ $t('company_profile.delete_company') }}
          </button>
          <Modal ref="deleteCompanyModal"
                 :title="t('company_profile.delete_company')">
            <p>{{ $t('company_profile.delete_company_confirm') }}</p>
            <div class="d-flex gap-2 justify-content-end">
              <button class="btn btn-secondary"
                      data-bs-dismiss="modal"
                      aria-label="Close"
              >{{ $t('common.cancel') }}
              </button>
              <button class="btn btn-danger"
                      data-bs-dismiss="modal"
                      @click="handleDeleteCompany"
              >{{ $t('company_profile.delete_company') }}
              </button>
            </div>
            <div v-if="deleteCompanyMessage"
                 class="alert mt-3 alert-danger"
            >
              {{ deleteCompanyMessage }}
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