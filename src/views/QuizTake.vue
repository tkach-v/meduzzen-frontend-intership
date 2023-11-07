<script setup>
import {onMounted, ref} from 'vue';
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import apiClient from "@/http/axios/apiClient";
import {getQuizById} from "@/services/quizzes.service";
import {toast} from "vue3-toastify";

const {t} = useI18n()
const route = useRoute()
const router = useRouter()

const quizInfo = ref({})
const selectedAnswers = ref([])
const buttonDisabled = ref(false)

const submitQuiz = async () => {
  try {
    // Check if any questions have no answers selected
    const unansweredQuestions = selectedAnswers.value.filter((item) => item.answers.length === 0);
    if (unansweredQuestions.length > 0) {
      toast.error(t('company_profile.all_answers_required'))
      return
    }

    const requestData = {user_answers: selectedAnswers.value}
    const {data} = await apiClient.post(`/api/quizzes/${route.params.quizId}/undergo/`, requestData)
    buttonDisabled.value = true

    // Show user his score and redirect to the company page
    const score = (data.correct_questions / data.total_questions).toFixed(2) * 100
    toast.success(t('company_profile.result') + score + '%')
    setTimeout(() => {
      router.push({name: 'companyProfile'})
    }, 5000)
  } catch (err) {
    toast.error("Error: " + err.response.data.detail)
  }
};

onMounted(async () => {
  quizInfo.value = await getQuizById(route.params.quizId)
  if (quizInfo.value.questions) {
    quizInfo.value.questions.forEach((question) => {
      selectedAnswers.value.push({question: question.id, answers: []})
    })
  }
});
</script>

<template>
  <div class="container mt-5">
    <div class="d-flex align-items-end border-bottom pb-3">
      <h1 class="fw-bold m-0">{{ quizInfo.title }}</h1>
      <p class="fs-4 m-0 ms-auto"
         v-if="quizInfo.questions"
      >
        <span class="fw-bold">{{ $t('company_profile.questions_number') }}: </span>{{ quizInfo.questions.length }}
      </p>
    </div>
    <form @submit.prevent="submitQuiz">
      <div class="mt-5"
           v-for="(question, idx) in quizInfo.questions"
           :key="question.id">
        <div>{{ $t('company_profile.question') }} {{ idx + 1 }}</div>
        <h3 class="mb-3 mt-1">{{ question.text }}</h3>
        <div class="list-group">
          <div v-for="(answer) in question.answers"
               :key="answer.id"
               class="list-group-item list-group-item-action">
            <div class="form-check">
              <input v-model="selectedAnswers[idx].answers"
                     :value="answer.id"
                     class="form-check-input"
                     type="checkbox"
                     name="flexRadioDefault"
                     :id="answer.id">
              <label
                  class="form-check-label stretched-link"
                  :for="answer.id"
              >{{ answer.text }}</label>
            </div>
          </div>
        </div>
      </div>
      <button class="d-flex btn btn-primary px-5 ms-auto mt-3 fs-5"
              :disabled="buttonDisabled"
      >{{ t('company_profile.send') }}
      </button>
    </form>
  </div>
</template>