<script setup>
import {defineProps, onMounted, ref} from 'vue';
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import UniversalTable from "@/components/UniversalTable.vue";
import CreateQuiz from "@/components/CreateQuiz.vue";
import {getCompanyQuizzes} from "@/services/quizzes.service";
import ImportQuiz from "@/components/ImportQuiz.vue";

const props = defineProps({
  companyId: Number,
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

const goToQuizPage = (quizId) => {
  router.push({name: 'quizProfile', params: {quizId: quizId}});
};

onMounted(async () => {
  quizzesList.value = await getCompanyQuizzes(props.companyId)
});
</script>

<template>
  <CreateQuiz v-if="isAdmin || isOwner"
                      :companyId="companyId"/>
  <ImportQuiz v-if="isAdmin || isOwner"
                      :companyId="companyId"/>
  <UniversalTable :columns="quizzesColumns"
                  :data="quizzesList"
                  :rowClick="goToQuizPage"/>
</template>