<script setup>
import {ErrorMessage, Field, Form, FieldArray} from "vee-validate";
import Modal from "@/components/Modal.vue";
import {defineProps, onMounted, ref} from "vue";
import apiClient from "@/http/axios/apiClient";
import {useI18n} from "vue-i18n";
import {toast} from "vue3-toastify";
import {quizSchema, questionSchema} from "@/configs/yupSchemas";

const props = defineProps({
  quizId: Number
})

const {t} = useI18n()
const questionInitial = {
  text: '',
  answers: [
    {text: '', is_correct: false},
    {text: '', is_correct: false},
  ]
}

const initialData = ref({})
const quizModal = ref(null)
const questionCreateModal = ref(null)

async function fetchQuiz() {
  try {
    const {data} = await apiClient.get(`/api/quizzes/${props.quizId}/`)
    initialData.value = data
  } catch (error) {
    console.error('API Error:', error)
  }
}

function showQuizModal() {
  quizModal.value.show();
}

function showQuestionCreateModal() {
  questionCreateModal.value.show();
}

const handleQuizUpdate = async (quizData, actions) => {
  try {
    await apiClient.patch(`/api/quizzes/${props.quizId}/`, quizData)
    actions.resetForm()
    toast.success(t('company_profile.quiz_update_success'))
    fetchQuiz()
  } catch (err) {
    toast.error("Error: " + err.response.data.detail)
  }
}

const handleQuestionCreate = async (questionData, actions) => {
  try {
    await apiClient.post(`/api/quizzes/${props.quizId}/add_question/`, questionData)
    await fetchQuiz()
    actions.resetForm()
    toast.success(t('company_profile.question_create_success'))
    questionCreateModal.value.hide()
  } catch (err) {
    toast.error("Error: " + err.response.data.detail)
  }
}

const handleQuestionDelete = async (questionId) => {
  try {
    if (initialData.value.questions.length <= 2) {
      toast.error("Error: " + t('company_profile.cannot_delete_last_questions'))
      return
    }
    await apiClient.post(`/api/quizzes/${props.quizId}/remove-question/`, {question_id: questionId})
    toast.success(t('company_profile.question_delete_success'))
    await fetchQuiz()
  } catch (err) {
    toast.error("Error: " + err.response.data.detail)
  }
}

onMounted(async () => {
  await fetchQuiz()
})
</script>

<template>
  <button class="btn btn-primary"
          type="button"
          @click="showQuizModal"
  >{{ t('company_profile.update_quiz') }}
  </button>
  <Modal ref="quizModal"
         :title="t('company_profile.update_quiz')"
         :wide="true">
    <Form @submit="handleQuizUpdate"
          :validation-schema="quizSchema"
          :initial-values="initialData">
      <div class="form-floating mb-3">
        <Field name="title"
               type="text"
               class="form-control"
               placeholder="Title"/>
        <label for="title">{{ $t('company_profile.quiz_title') }}</label>
        <ErrorMessage name="title" class="d-flex mt-2 invalid-feedback"/>
      </div>
      <div class="form-floating mb-3">
        <Field name="description"
               as="textarea"
               type="text"
               class="form-control"
               placeholder="Description"
               style="height: 125px"/>
        <label for="description">{{ $t('company_profile.quiz_description') }}</label>
        <ErrorMessage name="description" class="d-flex mt-2 invalid-feedback"/>
      </div>
      <div class="form-floating mb-3">
        <Field name="frequency"
               type="number"
               class="form-control"
               placeholder="Frequency"/>
        <label for="frequency">{{ $t('company_profile.quiz_frequency') }}</label>
        <ErrorMessage name="frequency" class="d-flex mt-2 invalid-feedback"/>
      </div>
      <button class="d-flex btn btn-primary px-3 ms-auto mt-3"
      >{{ t('common.save') }}
      </button>
    </Form>
    <div>
      <h4 class="mt-5 mb-4">{{ $t('company_profile.questions') }}:</h4>
      <div v-for="(question, index) in initialData.questions"
           :key="question.id"
           class="form-floating mb-5"
      >
        <h5>{{ question.text }}</h5>
        <ul>
          <li v-for="(answer, answerIndex) in question.answers"
              :key="answer.id"
              class="my-2 px-2"
              :class="answer.is_correct ? 'text-success' : ''">
            {{ answer.text + (answer.is_correct ? ` (${t('company_profile.correct')})` : '') }}
          </li>
        </ul>
        <button class="btn btn-danger"
                type="button"
                @click="handleQuestionDelete(question.id)"
        >{{ $t('company_profile.delete_question') }}
        </button>
      </div>
      <button type="button"
              class="btn btn-primary w-100"
              @click="showQuestionCreateModal"
      >{{ $t('company_profile.add_question') }}
      </button>
      <Modal ref="questionCreateModal"
             :title="t('company_profile.add_question')">
        <Form @submit="handleQuestionCreate"
              :validation-schema="questionSchema"
              :initial-values="questionInitial">
          <div class="form-floating mb-3">
            <Field name="text"
                   as="textarea"
                   type="text"
                   class="form-control"
                   placeholder="Questjion Text"/>
            <label for="text">{{ $t('company_profile.question_text') }}</label>
            <ErrorMessage name="text" class="d-flex mt-2 invalid-feedback"/>
            <FieldArray name="answers"
                        v-slot="{ fields, push, remove}"
            >
              <ul>
                <li v-for="(field, idx) in fields"
                    :key="field.key"
                    class="my-2 px-2 position-relative border border-1 rounded">
                  <Field :name="`answers[${idx}].text`"
                         type="text"
                         class="form-control-plaintext"
                         :placeholder="t('company_profile.question_text')"/>
                  <ErrorMessage :name="`answers[${idx}].text`"
                                class="d-flex mt-2 invalid-feedback"/>
                  <div class="form-check">
                    <Field :name="`answers[${idx}].is_correct`"
                           :value="true"
                           class="form-check-input"
                           type="checkbox"/>
                    <label class="form-check-label"
                           :for="`answers[${idx}].is_correct`"
                    >{{ $t('company_profile.correct') }}</label>
                  </div>
                  <button type="button"
                          class="btn-close delete-answer-btn"
                          @click="remove(idx)"
                          title="Delete Answer"
                  ></button>
                </li>
              </ul>
              <ErrorMessage name="answers" class="d-flex mt-2 invalid-feedback"/>
              <button class="btn btn-primary"
                      type="button"
                      @click="push({'text': '', is_correct: false})"
              >{{ $t('company_profile.add_answer') }}
              </button>
            </FieldArray>
          </div>
          <button class="d-flex btn btn-primary px-3 ms-auto mt-3"
          >{{ t('company_profile.add_question') }}
          </button>
        </Form>
      </Modal>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.delete-answer-btn {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translate(0, -50%);
}
</style>