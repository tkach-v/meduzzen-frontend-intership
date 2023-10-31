<script setup>
import {computed, defineProps, onMounted, ref} from 'vue';
import * as yup from "yup";
import {useI18n} from "vue-i18n";
import {ErrorMessage, Field, Form} from "vee-validate";
import Modal from "@/components/Modal.vue";
import apiClient from "@/http/axios/apiClient";
import {fetchCompanyById} from "@/services/company.service";
import {useRouter} from "vue-router";
import UniversalTable from "@/components/UniversalTable.vue";

const {t} = useI18n()
const router = useRouter()

const requestsList = ref([])
let createRequestModal = ref(null);
const createRequestMessage = ref('')
let cancelRequestModal = ref(null);
const cancelRequestMessage = ref('')

const pendingRequestsColumns = [
  {label: "#", field: "id"},
  {label: "Email", field: "company.name"},
]

const revolvedRequestsColumns = [
  {label: "#", field: "id"},
  {label: "Email", field: "company.name"},
  {label: "Status", field: "status"},
]

const pendingRequests = computed(() => {
  return requestsList.value.filter(request => request.status === 'Pending');
});
const resolvedRequests = computed(() => {
  return requestsList.value.filter(request => request.status !== 'Pending');
});

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

function showCreateRequestModal() {
  createRequestModal.value.show();
}

const createRequestSchema = yup.object().shape({
  company: yup
      .number()
      .required(t('user_profile.company_id_required'))
});
const handleCreateRequest = async (companyData, actions) => {
  try {
    await apiClient.post('/api/users/me/requests/', companyData)
    actions.resetForm()
    createRequestMessage.value = ""
  } catch (err) {
    createRequestMessage.value = "Error: " + JSON.stringify(err.response.data)
  }
}

function showCancelRequestModal() {
  cancelRequestModal.value.show();
}

const cancelRequestSchema = yup.object().shape({
  request: yup
      .number()
      .required(t('user_profile.request_id_required'))
});
const handleCancelRequest = async (requestData, actions) => {
  try {
    await apiClient.post(`/api/users/me/requests/${requestData.request}/cancel/`)
    actions.resetForm()
    cancelRequestMessage.value = ""
  } catch (err) {
    cancelRequestMessage.value = t('user_profile.requests_cancel_error')
  }
}

const goToCompanyPage = (companyId) => {
  router.push({name: 'companyProfile', params: {id: companyId}});
};

onMounted(async () => {
  await fetchUserRequests('/api/users/me/requests/')
});
</script>

<template>
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
  <UniversalTable :columns="pendingRequestsColumns"
                  :data="pendingRequests"
                  :rowClick="goToCompanyPage"/>
  <h4>{{ $t('company_profile.resolved_requests') }}:</h4>
  <UniversalTable :columns="revolvedRequestsColumns"
                  :data="resolvedRequests"
                  :rowClick="goToCompanyPage"/>
</template>

<style scoped lang="scss">
tr {
  cursor: pointer;
}
</style>