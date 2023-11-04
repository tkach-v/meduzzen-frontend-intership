<script setup>
import {onMounted, ref} from 'vue';
import {useStore} from 'vuex';
import {useRoute, useRouter} from "vue-router";
import i18n from "@/i18n/index"
import {useI18n} from "vue-i18n";
import apiClient from "@/http/axios/apiClient";
import Modal from "@/components/Modal.vue";
import UpdateQuiz from "@/components/UpdateQuiz.vue";
import LocalizedLink from "@/components/LocalizedLink.vue";
import {getQuizById} from "@/services/quizzes.service";

const {t} = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore();

const quizInfo = ref({})
const isAdmin = ref(false)
const isOwner = ref(false)
const deleteQuizModal = ref(null)

async function fetchUserRolesInCompany(companyId) {
  try {
    const currentUser = store.state.auth.user
    const {data} = await apiClient.get(`/api/companies/${companyId}/`)
    isAdmin.value = data.administrators.includes(currentUser.id)
    isOwner.value = data.owner === currentUser.id
  } catch (error) {
    console.error('API Error:', error)
  }
}

function showDeleteQuizModal() {
  deleteQuizModal.value.show();
}

const handleDeleteQuiz = async () => {
  try {
    await apiClient.delete(`/api/quizzes/${quizInfo.value.id}/`)
    deleteQuizModal.value.hide()
    await router.push({name: 'companyProfile', params: {locale: i18n.global.locale.value, id: quizInfo.value.company}});
  } catch (error) {
    console.log('API Error:', error)
  }
}

const formatDate = (dateString) => {
  const createdAt = new Date(dateString)
  return createdAt.toLocaleDateString()
};

onMounted(async () => {
  await fetchUserRolesInCompany(route.params.id)
  quizInfo.value = await getQuizById(route.params.quizId)
});
</script>

<template>
  <div class="container mt-5">
    <div class="card">
      <div class="card-body">
        <div>
          <h4 class="mb-3">{{ quizInfo.title }}</h4>
          <p class="mb-2"
             style="white-space: pre-line"
             v-if="quizInfo.description">
            <b>{{ $t('company_profile.description') }}: </b>{{ quizInfo.description }}
          </p>
          <p class="mb-2"><b>{{ $t('company_profile.frequency') }}: </b>{{ quizInfo.frequency }}</p>
          <p class="mb-2"><b>{{ $t('company_profile.created_at') }}: </b>{{ formatDate(quizInfo.created_at) }}</p>
          <p class="mb-2"><b>{{ $t('company_profile.updated_at') }}: </b>{{ formatDate(quizInfo.updated_at) }}</p>
        </div>
        <div class="mt-4">
          <LocalizedLink class="btn btn-success me-2"
                         :to="{name: 'quizTake'}"
          >{{ $t('company_profile.take_quiz') }}</LocalizedLink>
          <template v-if="isOwner || isAdmin">
            <UpdateQuiz v-if="isAdmin || isOwner"
                        :quizId="parseInt(route.params.quizId)"/>
            <button class="btn btn-danger ms-2"
                    type="button"
                    @click="showDeleteQuizModal"
            >{{ $t('company_profile.delete_quiz') }}
            </button>
            <Modal ref="deleteQuizModal"
                   :title="t('company_profile.delete_quiz')">
              <p>{{ $t('company_profile.delete_quiz_confirm') }}</p>
              <div class="d-flex gap-2 justify-content-end">
                <button class="btn btn-secondary"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                >{{ $t('common.cancel') }}
                </button>
                <button class="btn btn-danger"
                        @click="handleDeleteQuiz"
                >{{ $t('company_profile.delete_quiz') }}
                </button>
              </div>
            </Modal>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>