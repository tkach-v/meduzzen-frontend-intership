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

const pendingInvitationsColumns = [
  {label: "#", field: "id"},
  {label: "Email", field: "recipient.email"},
]

const revolvedInvitationsColumns = [
  {label: "#", field: "id"},
  {label: "Email", field: "recipient.email"},
  {label: "Status", field: "status"},
]

const invitationList = ref([])
let createInvitationModal = ref(null);
const createInvitationMessage = ref('')
let revokeInvitationModal = ref(null);
const revokeInvitationMessage = ref('')

const pendingInvitations = computed(() => {
  return invitationList.value.filter(invitation => invitation.status === 'Pending');
});
const resolvedInvitations = computed(() => {
  return invitationList.value.filter(invitation => invitation.status !== 'Pending');
});

async function fetchCompanyInvitations(url) {
  try {
    const response = await apiClient.get(url)

    const {results, next} = response.data
    for (const invitation of results) {
      invitation.recipient = await fetchUserById(invitation.recipient)
      invitationList.value = [...invitationList.value, invitation]
    }

    if (next) {
      await fetchCompanyInvitations(next)
    }

  } catch (error) {
    console.error('API Error:', error)
  }
}

function showCreateInvitationModal() {
  createInvitationModal.value.show();
}

const createInvitationSchema = yup.object().shape({
  recipient: yup
      .number()
      .required(t('company_profile.recipient_id_required'))
});
const handleCreateInvitation = async (recipientData, actions) => {
  try {
    await apiClient.post(`/api/companies/${props.companyId}/invitations/`, recipientData)
    actions.resetForm()
    createInvitationMessage.value = ""
  } catch (err) {
    createInvitationMessage.value = "Error: " + JSON.stringify(err.response.data)
  }
}

function showRevokeInvitationModal() {
  revokeInvitationModal.value.show();
}

const revokeInvitationSchema = yup.object().shape({
  invitation: yup
      .number()
      .required(t('company_profile.invitation_id_required'))
});
const handleRevokeInvitation = async (invitationData, actions) => {
  try {
    await apiClient.post(`/api/companies/${props.companyId}/invitations/${invitationData.invitation}/revoke/`)
    actions.resetForm()
    revokeInvitationMessage.value = ""
  } catch (err) {
    revokeInvitationMessage.value = t('company_profile.revoke_error')
  }
}

const goToUserPage = (userId) => {
  router.push({name: 'userProfile', params: {id: userId}});
};

onMounted(async () => {
  await fetchCompanyInvitations(`/api/companies/${props.companyId}/invitations/`)
});
</script>

<template>
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
  <UniversalTable :columns="pendingInvitationsColumns"
                  :data="pendingInvitations"
                  :rowClick="goToUserPage"/>
  <h4>{{ $t('company_profile.resolved_invitations') }}:</h4>
  <UniversalTable :columns="revolvedInvitationsColumns"
                  :data="resolvedInvitations"
                  :rowClick="goToUserPage"/>
</template>

<style scoped lang="scss">
tr {
  cursor: pointer;
}
</style>