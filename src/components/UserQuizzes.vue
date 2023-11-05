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

const goToQuizPage = async (quizId) => {
  const {company} = await getQuizById(quizId)
  router.push({name: 'quizProfile', params: {id: company, quizId: quizId}});
};

onMounted(async () => {
  await fetchUserQuizzes('/api/quizzes/')
});
</script>

<template>
  <UniversalTable :columns="quizzesColumns"
                  :data="quizzesList"
                  :rowClick="goToQuizPage"/>
</template>