<script setup>
import {defineProps, onMounted, ref} from 'vue';
import apiClient from "@/http/axios/apiClient";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import UniversalTable from "@/components/UniversalTable.vue";
import CreateQuiz from "@/components/CreateQuiz.vue";

const props = defineProps({
  companyId: Number,
  isMember: Boolean,
  isAdmin: Boolean,
  isOwner: Boolean,
})

const {t} = useI18n()
const router = useRouter()

const quizzesColumns = [
  {label: "#", field: "id"},
  {label: "Title", field: "title"},
]

const quizzesList = ref([])

async function fetchCompanyQuizzes() {
  try {
    const {data} = await apiClient.get(`/api/companies/${props.companyId}/quizzes/`)
    quizzesList.value = data
  } catch (error) {
    console.error('API Error:', error)
  }
}

const goToQuizPage = (quizId) => {
  router.push({name: 'quizProfile', params: {quizId: quizId}});
};

onMounted(async () => {
  await fetchCompanyQuizzes()
});
</script>

<template>
  <CreateQuiz v-if="isAdmin || isOwner"
                      :companyId="companyId"/>
  <UniversalTable :columns="quizzesColumns"
                  :data="quizzesList"
                  :rowClick="goToQuizPage"/>
</template>