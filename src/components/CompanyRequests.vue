<script setup>
import {computed, defineProps, onMounted, ref} from 'vue';
import apiClient from "@/http/axios/apiClient";
import {fetchUserById} from "@/services/users.service";
import * as yup from "yup";
import {ErrorMessage, Field, Form} from "vee-validate";
import Modal from "@/components/Modal.vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import UniversalTable from "@/components/UniversalTable.vue";

const props = defineProps({
  companyId: Number
})

const {t} = useI18n()
const router = useRouter()

const pendingRequestsColumns = [
  {label: "#", field: "id"},
  {label: "Email", field: "sender.email"},
]

const revolvedRequestsColumns = [
  {label: "#", field: "id"},
  {label: "Email", field: "sender.email"},
  {label: "Status", field: "status"},
]

const requestsList = ref([])
let approveRequestModal = ref(null);
const approveRequestMessage = ref('')
let rejectRequestModal = ref(null);
const rejectRequestMessage = ref('')

const pendingRequests = computed(() => {
  return requestsList.value.filter(request => request.status === 'Pending');
});
const resolvedRequests = computed(() => {
  return requestsList.value.filter(request => request.status !== 'Pending');
});

async function fetchCompanyRequests(url) {
  try {
    const response = await apiClient.get(url)

    const {results, next} = response.data
    for (const request of results) {
      request.sender = await fetchUserById(request.sender)
      requestsList.value = [...requestsList.value, request];
    }

    if (next) {
      await fetchCompanyRequests(next)
    }

  } catch (error) {
    console.error('API Error:', error)
  }
}


function showApproveRequestModal() {
  approveRequestModal.value.show();
}

const requestSchema = yup.object().shape({
  request: yup
      .number()
      .required(t('user_profile.request_id_required'))
});
const handleApproveRequest = async (requestData, actions) => {
  try {
    await apiClient.post(`/api/companies/${props.companyId}/requests/${requestData.request}/approve/`)
    actions.resetForm()
    approveRequestMessage.value = ""
  } catch (err) {
    approveRequestMessage.value = "Error: " + JSON.stringify(err.response.data.detail)
  }
}


function showRejectRequestModal() {
  rejectRequestModal.value.show();
}

const handleRejectRequest = async (requestData, actions) => {
  try {
    await apiClient.post(`/api/companies/${props.companyId}/requests/${requestData.request}/reject/`)
    actions.resetForm()
    rejectRequestMessage.value = ""
  } catch (err) {
    rejectRequestMessage.value = "Error: " + JSON.stringify(err.response.data.detail)
  }
}

const goToUserPage = (userId) => {
  router.push({name: 'userProfile', params: {id: userId}});
};

onMounted(async () => {
  await fetchCompanyRequests(`/api/companies/${props.companyId}/requests/`)
});
</script>

<template>
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
  <UniversalTable :columns="pendingRequestsColumns"
                  :data="pendingRequests"
                  :rowClick="goToUserPage"/>
  <h4>{{ $t('company_profile.resolved_requests') }}:</h4>
  <UniversalTable :columns="revolvedRequestsColumns"
                  :data="resolvedRequests"
                  :rowClick="goToUserPage"/>
</template>

<style scoped lang="scss">
tr {
  cursor: pointer;
}
</style>