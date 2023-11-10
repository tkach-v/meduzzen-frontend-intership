<script setup>
import {computed, defineProps, ref} from 'vue';
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import UniversalTable from "@/components/UniversalTable.vue";
import {ErrorMessage, Field, Form} from "vee-validate";
import Modal from "@/components/Modal.vue";
import {userIdSchema} from "@/configs/yupSchemas";
import apiClient from "@/http/axios/apiClient";
import {handleExportData} from "@/utils";

const props = defineProps({
  companyId: Number,
  isAdmin: Boolean,
  isOwner: Boolean,
  members: Array
})

const {t} = useI18n()
const router = useRouter()

const removeUserModal = ref(null)
const removeUserMessage = ref('')
const selectedMember = ref(null)

const userListColumns = computed(() => {
  if (props.isOwner || props.isAdmin) {
    return [
      {label: "#", field: "user_id"},
      {label: "Email", field: "email"},
      {label: "Last test-taking time", field: "last_test_timestamp"},
    ]
  }
  return [
    {label: "#", field: "id"},
    {label: "Email", field: "email"},
  ]
})

function getExportDataUrl(format) {
  let exportUrl = `/api/companies/${props.companyId}/export-results/${format}/`
  if (selectedMember.value) {
    exportUrl += `?user=${selectedMember.value}`
  }
  return exportUrl
}

function showRemoveUserModal() {
  removeUserModal.value.show();
}

const removeUserSchema = userIdSchema(t('company_profile.user_id_required'))
const handleRemoveUser = async (userData, actions) => {
  try {
    await apiClient.post(`/api/companies/${props.companyId}/remove-user/`, userData)
    actions.resetForm()
    removeUserMessage.value = ""
  } catch (err) {
    removeUserMessage.value = "Error: " + err.response.data.detail
  }
}

const goToUserPage = (userId) => {
  router.push({name: 'userProfile', params: {id: userId}});
};
</script>

<template>
  <div class="mb-4"
       v-if="isOwner || isAdmin">
    <h4>{{ $t('company_profile.export_results') }}:</h4>
    <div class="d-flex align-items-center mb-3">
      <div class="me-3">{{ $t('company_profile.select_user_or_all') }}:</div>
      <select v-model="selectedMember"
              class="me-auto form-select"
              style="max-width: 250px">
        <option :value="null">{{ $t('company_profile.export_every') }}</option>
        <option v-for="member in members"
                :key="member.user_id"
                :value="member.user_id"
        >{{ member.email }}
        </option>
      </select>
    </div>
    <button class="btn btn-primary me-2"
            @click="handleExportData(
              'csv',
              `${getExportDataUrl('csv')}`,
          `user${selectedMember}_results`
          )"
    >{{ $t('user_profile.export_csv') }}
    </button>
    <button class="btn btn-primary"
            @click="handleExportData(
              'json',
              `${getExportDataUrl('json')}`,
          `user${selectedMember}_results`
          )"
    >{{ $t('user_profile.export_json') }}
    </button>
  </div>
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
        <button class="d-flex btn btn-danger px-3 ms-auto">{{ $t('company_profile.remove_member') }}</button>
      </Form>
      <div v-if="removeUserMessage"
           class="alert mt-3 alert-danger"
      >
        {{ removeUserMessage }}
      </div>
    </Modal>
  </div>
  <UniversalTable :columns="userListColumns"
                  :data="members"
                  :rowClick="goToUserPage"/>
</template>