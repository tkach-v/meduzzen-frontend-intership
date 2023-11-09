<script setup>
import {defineProps, onMounted, ref} from 'vue';
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import UniversalTable from "@/components/UniversalTable.vue";
import apiClient from "@/http/axios/apiClient";
import {getQuizById, getQuizLastTakenTime} from "@/services/quizzes.service";

const props = defineProps({
  userId: Number,
})

const {t} = useI18n()
const router = useRouter()

const quizzesColumns = [
  {label: "#", field: "id"},
  {label: "Title", field: "title"},
  {label: "Last test-taking time", field: "last_taken_time"},
]

const quizzesList = ref([])
const selectedQuiz = ref(null)

async function fetchUserQuizzes(url) {
  try {
    const response = await apiClient.get(url)
    const {results, next} = response.data

    for (const quiz of results) {
      const {last_taken_time} = await getQuizLastTakenTime(quiz.id, props.userId)
      quiz.last_taken_time = last_taken_time
      quizzesList.value = [...quizzesList.value, quiz]
    }

    if (next) {
      await fetchUserQuizzes(next)
    }
  } catch (error) {
    console.error('API Error:', error)
  }
}

async function handleExportData(format) {
  try {
    const {data} = await apiClient.get(`/api/quizzes/${selectedQuiz.value}/export-results/${format}/`)

    const blobData = format === 'csv' ? data : JSON.stringify(data)
    const blobType = format === 'csv' ? `text/csv` : `application/json`
    const blob = new Blob([blobData], {type: blobType})

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quiz${selectedQuiz.value}_results.${format}`
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('API Error:', error)
  }
}

const goToQuizPage = async (quizId) => {
  const {company} = await getQuizById(quizId)
  router.push({name: 'quizProfile', params: {id: company, quizId: quizId}});
};

onMounted(async () => {
  await fetchUserQuizzes('/api/quizzes/')
  selectedQuiz.value = quizzesList.value[0].id
})
</script>

<template>
  <h4>{{ $t('user_profile.export_results') }}:</h4>
  <div class="d-flex align-items-center mb-3">
    <div class="me-3">{{ $t('company_profile.select_quiz') }}:</div>
    <select v-model="selectedQuiz"
            class="me-auto form-select"
            style="max-width: 250px">
      <option v-for="quiz in quizzesList"
              :key="quiz.id"
              :value="quiz.id"
      >{{ quiz.title }}
      </option>
    </select>
  </div>
  <button class="btn btn-primary me-2"
          @click="handleExportData('csv')"
  >{{ $t('user_profile.export_csv') }}
  </button>
  <button class="btn btn-primary"
          @click="handleExportData('json')"
  >{{ $t('user_profile.export_json') }}
  </button>
  <h4 class="mt-5">{{ $t('company_profile.quizzes') }}:</h4>
  <UniversalTable :columns="quizzesColumns"
                  :data="quizzesList"
                  :rowClick="goToQuizPage"/>
</template>