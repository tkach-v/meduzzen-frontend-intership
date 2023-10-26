<script setup>
import {computed, defineProps, onMounted, ref} from 'vue';
import * as yup from "yup";
import {useI18n} from "vue-i18n";
import {ErrorMessage, Field, Form} from "vee-validate";
import Modal from "@/components/Modal.vue";
import apiClient from "@/http/axios/apiClient";
import {fetchCompanyById} from "@/services/company.service";
import {useRouter} from "vue-router";

const {t} = useI18n()
const router = useRouter()

const invitationList = ref([])
let declineInvitationModal = ref(null);
const declineInvitationMessage = ref('')
let acceptInvitationModal = ref(null);
const acceptInvitationMessage = ref('')

const pendingInvitations = computed(() => {
  return invitationList.value.filter(invitation => invitation.status === 4);
});
const resolvedInvitations = computed(() => {
  return invitationList.value.filter(invitation => invitation.status !== 4);
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


function showDeclineInvitationModal() {
  declineInvitationModal.value.show();
}

const invitationSchema = yup.object().shape({
  invitation: yup
      .number()
      .required(t('company_profile.invitation_id_required'))
});
const handleDeclineInvitation = async (invitationData, actions) => {
  try {
    await apiClient.post(`/api/users/me/invitations/${invitationData.invitation}/decline/`)
    actions.resetForm()
    declineInvitationMessage.value = ""
  } catch (err) {
    declineInvitationMessage.value = "Error: " + err.response.data.detail
  }
}

function showAcceptInvitationModal() {
  acceptInvitationModal.value.show();
}

const handleAcceptInvitation = async (invitationData, actions) => {
  try {
    await apiClient.post(`/api/users/me/invitations/${invitationData.invitation}/accept/`)
    actions.resetForm()
    acceptInvitationMessage.value = ""
  } catch (err) {
    acceptInvitationMessage.value = "Error: " + err.response.data.detail
  }
}

const goToCompanyPage = (companyId) => {
  router.push({name: 'companyProfile', params: {id: companyId}});
};

onMounted(async () => {
  await fetchUserInvitations('/api/users/me/invitations/')
});
</script>

<template>
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
</template>

<style scoped lang="scss">
tr {
  cursor: pointer;
}
</style>