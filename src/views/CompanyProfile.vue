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
import UniversalTable from "@/components/UniversalTable.vue";
import CompanyAdmins from "@/components/CompanyAdmins.vue";
import {userIdSchema} from "@/configs/yupSchemas";

const {t} = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore();

const userListColumns = [
  {label: "#", field: "id"},
  {label: "Email", field: "email"},
]

const companyInfo = ref({})
const membersList = ref([])
let deleteCompanyModal = ref(null);
const deleteCompanyMessage = ref('')
const changeInfoMessage = ref('');
let removeUserModal = ref(null);
const removeUserMessage = ref('')

const currentUser = computed(() => store.state.auth.user)
const isOwner = computed(() => currentUser.value.id === companyInfo.value.owner)
const isMember = computed(() => companyInfo.value.members && companyInfo.value.members.includes(currentUser.value.id))

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

const goToUserPage = (userId) => {
  router.push({name: 'userProfile', params: {id: userId}});
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

function showRemoveUserModal() {
  removeUserModal.value.show();
}

const removeUserSchema = userIdSchema(t('company_profile.user_id_required'))
const handleRemoveUser = async (userData, actions) => {
  try {
    await apiClient.post(`/api/companies/${companyInfo.value.id}/remove-user/`, userData)
    actions.resetForm()
    removeUserMessage.value = ""
  } catch (err) {
    removeUserMessage.value = "Error: " + err.response.data.detail
  }
}

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
              :itemTitle="t('company_profile.members')"
              itemSuffix="Members"
              parentSelector="#profileAccordion"
          >
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
            <UniversalTable :columns="userListColumns"
                            :data="membersList"
                            :rowClick="goToUserPage"/>
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