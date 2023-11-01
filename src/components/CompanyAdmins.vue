<script setup>
import {defineProps, onMounted, ref} from 'vue';
import apiClient from "@/http/axios/apiClient";
import {fetchUserById} from "@/services/users.service";
import {ErrorMessage, Field, Form} from "vee-validate";
import Modal from "@/components/Modal.vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import UniversalTable from "@/components/UniversalTable.vue";
import {userIdSchema} from "@/configs/yupSchemas";

const props = defineProps({
  companyId: Number,
  admins: Array
})

const {t} = useI18n()
const router = useRouter()

const adminsColumns = [
  {label: "#", field: "id"},
  {label: "Email", field: "email"},
]

const adminsList = ref([])
let appointAdminModal = ref(null);
const appointAdminMessage = ref('')
let removeAdminModal = ref(null);
const removeAdminMessage = ref('')

async function fetchCompanyAdmins() {
  try {
    const admins = [];
    for (const admin of props.admins) {
      admins.push(await fetchUserById(admin))
    }
    adminsList.value = admins;
  } catch (error) {
    console.error('API Error:', error)
  }
}

function showAppointAdminModal() {
  appointAdminModal.value.show();
}


const appointAdminSchema = userIdSchema(t('company_profile.user_id_required'))
const handleAppointAdmin = async (recipientData, actions) => {
  try {
    await apiClient.post(`/api/companies/${props.companyId}/add-admin/`, recipientData)
    actions.resetForm()
    appointAdminMessage.value = ""
  } catch (err) {
    appointAdminMessage.value = "Error: " + JSON.stringify(err.response.data)
  }
}

function showRemoveAdminModal() {
  removeAdminModal.value.show();
}

const removeAdminSchema = userIdSchema(t('company_profile.admin_id_required'))
const handleRemoveAdmin = async (adminData, actions) => {
  try {
    await apiClient.post(`/api/companies/${props.companyId}/remove-admin/`, adminData)
    actions.resetForm()
    removeAdminMessage.value = ""
  } catch (err) {
    removeAdminMessage.value = "Error: " + JSON.stringify(err.response.data)
  }
}

const goToUserPage = (userId) => {
  router.push({name: 'userProfile', params: {id: userId}});
};

onMounted(async () => {
  await fetchCompanyAdmins()
});
</script>

<template>
  <button class="mb-4 btn btn-primary"
          type="button"
          @click="showAppointAdminModal"
  >{{ $t('company_profile.appoint_admin') }}
  </button>
  <Modal ref="appointAdminModal"
         :title="t('company_profile.appoint_admin')">
    <Form @submit="handleAppointAdmin"
          :validation-schema="appointAdminSchema">
      <div class="form-floating mb-3">
        <Field name="user_id"
               type="number"
               class="form-control"
               placeholder="Recipient"/>
        <label for="user_id">{{ $t('company_profile.user_id') }}</label>
        <ErrorMessage name="user_id" class="d-flex mt-2 invalid-feedback"/>
      </div>
      <button class="d-flex btn btn-primary px-3 ms-auto">{{ $t('company_profile.appoint_admin') }}</button>
    </Form>
    <div v-if="appointAdminMessage"
         class="alert mt-3 alert-danger"
    >
      {{ appointAdminMessage }}
    </div>
  </Modal>
  <button class="ms-2 mb-4 btn btn-danger"
          type="button"
          @click="showRemoveAdminModal"
  >{{ $t('company_profile.remove_admin') }}
  </button>
  <Modal ref="removeAdminModal"
         :title="t('company_profile.remove_admin')">
    <Form @submit="handleRemoveAdmin"
          :validation-schema="removeAdminSchema">
      <div class="form-floating mb-3">
        <Field name="user_id"
               type="number"
               class="form-control"
               placeholder="Invitation"/>
        <label for="user_id">{{ $t('company_profile.admin_id') }}</label>
        <ErrorMessage name="user_id" class="d-flex mt-2 invalid-feedback"/>
      </div>
      <button class="d-flex btn btn-danger px-3 ms-auto">{{ $t('company_profile.remove_admin') }}</button>
    </Form>
    <div v-if="removeAdminMessage"
         class="alert mt-3 alert-danger"
    >
      {{ removeAdminMessage }}
    </div>
  </Modal>
  <UniversalTable :columns="adminsColumns"
                  :data="adminsList"
                  :rowClick="goToUserPage"/>
</template>