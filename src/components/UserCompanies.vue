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

const companyListColumns = [
  {label: "#", field: "id"},
  {label: "Name", field: "name"},
]

const userCompanies = ref([])
let leaveCompanyModal = ref(null);
const leaveCompanyMessage = ref('')

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

function showLeaveCompanyModal() {
  leaveCompanyModal.value.show();
}

const leaveCompanySchema = yup.object().shape({
  company: yup
      .number()
      .required(t('user_profile.company_id_required'))
});
const handleLeaveCompany = async (companyData, actions) => {
  try {
    await apiClient.post(`/api/users/me/companies/${companyData.company}/leave/`, {})
    actions.resetForm()
    leaveCompanyMessage.value = ""
  } catch (err) {
    leaveCompanyMessage.value = "Error: " + err.response.data.detail
  }
}

const goToCompanyPage = (companyId) => {
  router.push({name: 'companyProfile', params: {id: companyId}});
};

onMounted(async () => {
  await fetchUserCompanies('/api/users/me/companies/')
});
</script>

<template>
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
  <UniversalTable :columns="companyListColumns"
                  :data="userCompanies"
                  :rowClick="goToCompanyPage"/>
</template>

<style scoped lang="scss">
tr {
  cursor: pointer;
}
</style>