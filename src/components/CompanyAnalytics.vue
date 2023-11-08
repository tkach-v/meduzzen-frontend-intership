<script setup>
import {computed, defineProps, onMounted, ref, watch} from 'vue';
import {useI18n} from "vue-i18n";
import LineChart from "@/components/LineChart.vue";
import apiClient from "@/http/axios/apiClient";
import {getCompanyQuizzes} from "@/services/quizzes.service";
import {sortByTimestamp} from "@/utils";


const props = defineProps({
  companyId: Number,
  members: Array,
})

const {t} = useI18n()

const quizzesList = ref([])
const allUsersScoresX = ref([])
const allUsersScoresY = ref([])
const selectedUser = ref(null)
const selectedQuiz = ref(null)
const selectedUserScores = ref(null)

const userScores = computed(() => {
  if (selectedUserScores.value) {
    const quizData = selectedUserScores.value.filter(item => item.quiz_id === selectedQuiz.value)[0]
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

async function fetchAllUsersScores() {
  try {
    let {data} = await apiClient.get(`/api/quizzes/all-users-scores/`);
    data = sortByTimestamp(data)

    allUsersScoresX.value = data.map(item => item.timestamp)
    allUsersScoresY.value = data.map(item => item.score)
  } catch (error) {
    console.error('API Error:', error)
  }
}

async function fetchSelectedUserScores(userId) {
  try {
    const {data} = await apiClient.get(`/api/quizzes/user-quizzes-scores/?user=${userId}`)
    selectedUserScores.value = data
  } catch (error) {
    console.error('API Error:', error)
  }
}

onMounted(async () => {
  await fetchAllUsersScores()
  quizzesList.value = await getCompanyQuizzes(props.companyId)
  selectedQuiz.value = quizzesList.value[0].id

  if (props.members.length > 0) {
    selectedUser.value = props.members[0];
  }
});

watch(selectedUser, (newUser) => {
  if (newUser) {
    fetchSelectedUserScores(newUser.user_id);
  }
})
</script>

<template>
  <h4 class="text-center mb-3">{{ $t('company_profile.global_rating') }}</h4>
  <div class="mx-auto d-flex justify-content-center" style="max-width: 800px">
    <LineChart :x="allUsersScoresX"
               :y="allUsersScoresY"/>
  </div>
  <h4 class="text-center mt-5">{{ $t('company_profile.user_rating') }}</h4>
  <div class="d-flex align-items-center gap-3">
    <div class="ms-auto">{{ $t('company_profile.select_user') }}:</div>
    <select v-model="selectedUser"
            class="me-auto form-select"
            style="max-width: 250px">
      <option v-for="member in members"
              :key="member.id"
              :value="member"
      >{{ member.email }}
      </option>
    </select>
  </div>
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
    <LineChart :x="userScores.x"
               :y="userScores.y"/>
  </div>
</template>