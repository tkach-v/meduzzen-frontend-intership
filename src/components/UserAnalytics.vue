<script setup>
import {computed, defineProps, onMounted, ref, watch} from 'vue';
import {useI18n} from "vue-i18n";
import LineChart from "@/components/LineChart.vue";
import apiClient from "@/http/axios/apiClient";
import {sortByTimestamp} from "@/utils";

const props = defineProps({
  userId: Number,
})

const {t} = useI18n()

const selectedQuiz = ref(null)
const allUserScores = ref([])
const quizzesList = ref([])

async function fetchUserQuizzes(url) {
  try {
    const response = await apiClient.get(url)
    const {results, next} = response.data
    quizzesList.value = [...quizzesList.value, ...results]

    if (next) {
      await fetchUserQuizzes(next)
    }
  } catch (error) {
    console.error('API Error:', error)
  }
}

async function fetchUserScores() {
  try {
    const {data} = await apiClient.get(`/api/quizzes/user-quizzes-scores/?user=${props.userId}`)
    allUserScores.value = data
  } catch (error) {
    console.error('API Error:', error)
  }
}

const currentUserScores = computed(() => {
  if (allUserScores.value.length) {
    const quizData = allUserScores.value.filter(item => item.quiz_id === selectedQuiz.value)[0]
    if (quizData && quizData.results) {
      quizData.results = sortByTimestamp(quizData.results)
      return {
        x: quizData.results.map(item => item.timestamp),
        y: quizData.results.map(item => item.score)
      }
    }
  }
  return {x: [], y: []}
})

onMounted(async () => {
  await fetchUserQuizzes('/api/quizzes/')
  await fetchUserScores()
  selectedQuiz.value = quizzesList.value[0].id
})
</script>

<template>
  <h4 class="text-center">{{ $t('user_profile.user_rating') }}</h4>
  <div class="d-flex align-items-center gap-3 mt-2 mb-3">
    <div class="ms-auto">{{ $t('company_profile.select_quiz') }}:</div>
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
  <div class="mx-auto d-flex justify-content-center" style="max-width: 800px">
    <LineChart :x="currentUserScores.x"
               :y="currentUserScores.y"/>
  </div>
</template>