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
import AccordionItem from "@/components/AccordionItem.vue";
import CompanyInvitations from "@/components/CompanyInvitations.vue";
import CompanyRequests from "@/components/CompanyRequests.vue";
import CompanyAdmins from "@/components/CompanyAdmins.vue";
import CompanyQuizzes from "@/components/CompanyQuizzes.vue";
import CompanyAnalytics from "@/components/CompanyAnalytics.vue";
import CompanyMembers from "@/components/CompanyMembers.vue";

const {t} = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore();

const companyInfo = ref({})
const membersList = ref([])
let deleteCompanyModal = ref(null);
const deleteCompanyMessage = ref('')
const changeInfoMessage = ref('');

const currentUser = computed(() => store.state.auth.user)
const isMember = computed(() => {
  const members = companyInfo.value.members || [];
  return members.includes(currentUser.value.id);
})
const isAdmin = computed(() => {
  const administrators = companyInfo.value.administrators || [];
  return administrators.includes(currentUser.value.id);
})
const isOwner = computed(() => currentUser.value.id === companyInfo.value.owner)

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
    if (isOwner.value || isAdmin.value) {
      const {data} = await apiClient.get(`/api/companies/${companyInfo.value.id}/users-last-test-time/`);
      membersList.value = data
      return
    }

    const members = [];
    for (const member of companyInfo.value.members) {
      const data = await fetchUserById(member)
      members.push(data)
    }
    membersList.value = members;
  } catch (error) {
    console.error('API Error:', error)
  }
}

const formatDate = (dateString) => {
  const createdAt = new Date(dateString)
  return createdAt.toLocaleDateString()
};

function showDeleteCompanyModal() {
  deleteCompanyModal.value.show();
}

const handleDeleteCompany = async () => {
  try {
    await apiClient.delete(`/api/companies/${companyInfo.value.id}/`)
    await router.push({name: 'companiesList', params: {locale: i18n.global.locale.value}});
  } catch (err) {
    deleteCompanyMessage.value = t('user_profile.update_error')
  }
}

const companyInfoSchema = yup.object().shape({
  name: yup
      .string()
      .required(t('company_profile.name_required')),
  description: yup
      .string()
      .required(t('company_profile.description_required'))
});

const handleChangeInfo = async (companyData, actions) => {
  try {
    await apiClient.patch(`/api/companies/${companyInfo.value.id}/`, companyData)
    await fetchCompanyById(companyInfo.value.id)
    actions.resetForm()
  } catch (err) {
    changeInfoMessage.value = t('user_profile.company_create_error')
  }
};

onMounted(async () => {
  await fetchCompanyById(route.params.id)
  await fetchCompanyMembers()
});
</script>

<template>
  <div v-if="currentUser" class="container mt-5">
    <div class="card">
      <div class="card-body">
        <div>
          <h4 class="mb-3">{{ companyInfo.name }}</h4>
          <div class="alert alert-info py-2 mb-3" role="alert">
            <template v-if="isOwner">{{ $t('company_profile.user_owner') }}</template>
            <template v-else-if="isAdmin">{{ $t('company_profile.user_admin') }}</template>
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
          <AccordionItem
              v-if="isOwner"
              :itemTitle="t('company_profile.change_info')"
              itemSuffix="ChangeInfo"
              parentSelector="#profileAccordion"
          >
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
          </AccordionItem>
          <AccordionItem
              v-if="isMember"
              :itemTitle="t('company_profile.members')"
              itemSuffix="Members"
              parentSelector="#profileAccordion"
          >
            <CompanyMembers :companyId="companyInfo.id"
                            :isAdmin="isAdmin"
                            :isOwner="isOwner"
                            :members="membersList"/>
          </AccordionItem>
          <AccordionItem
              v-if="isMember"
              :itemTitle="t('company_profile.quizzes')"
              itemSuffix="Quizzes"
              parentSelector="#profileAccordion"
          >
            <CompanyQuizzes :companyId="companyInfo.id"
                            :isAdmin="isAdmin"
                            :isOwner="isOwner"/>
          </AccordionItem>
          <AccordionItem
              v-if="isOwner"
              :itemTitle="t('company_profile.admins')"
              itemSuffix="Admins"
              parentSelector="#profileAccordion"
          >
            <CompanyAdmins :companyId="companyInfo.id"
                           :admins="companyInfo.administrators"/>
          </AccordionItem>
          <AccordionItem
              v-if="isOwner"
              :itemTitle="t('company_profile.invitations')"
              itemSuffix="Invitations"
              parentSelector="#profileAccordion"
          >
            <CompanyInvitations :companyId="companyInfo.id"/>
          </AccordionItem>
          <AccordionItem
              v-if="isOwner"
              :itemTitle="t('company_profile.requests')"
              itemSuffix="UserRequests"
              parentSelector="#profileAccordion"
          >
            <CompanyRequests :companyId="companyInfo.id"/>
          </AccordionItem>
          <AccordionItem
              v-if="isOwner || isAdmin"
              :itemTitle="t('company_profile.analytics')"
              itemSuffix="UserAnalytics"
              parentSelector="#profileAccordion"
          >
            <CompanyAnalytics :companyId="companyInfo.id"
                              :members="membersList"/>
          </AccordionItem>
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