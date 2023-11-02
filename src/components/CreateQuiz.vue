<script setup>
import {ErrorMessage, Field, Form, FieldArray} from "vee-validate";
import Modal from "@/components/Modal.vue";
import {defineProps, ref} from "vue";
import apiClient from "@/http/axios/apiClient";
import {useI18n} from "vue-i18n";
import {toast} from "vue3-toastify";
import {createQuizSchema} from "@/configs/yupSchemas";

const props = defineProps({
  companyId: Number
})

const {t} = useI18n()
const initialData = {
  "title": "",
  "description": "",
  "frequency": 1,
  "questions": [
    {
      "text": "",
      "answers": [
        {"text": "", "is_correct": false},
        {"text": "", "is_correct": false},
      ]
    },
    {
      "text": "",
      "answers": [
        {"text": "", "is_correct": false},
        {"text": "", "is_correct": false},
      ]
    },
  ],
}

const quizModal = ref(null);

function showQuizModal() {
  quizModal.value.show();
}

const handleQuizCreate = async (quizData, actions) => {
  try {
    const requestData = {
      ...quizData,
      company: props.companyId
    }
    await apiClient.post('/api/quizzes/', requestData)
    actions.resetForm()
    toast.success(t('company_profile.quiz_create_success'))
    quizModal.value.hide()
  } catch (err) {
    toast.error("Error: " + err.response.data.detail)
  }
}
</script>

<template>
  <button class="btn btn-primary"
          type="button"
          @click="showQuizModal"
  >{{ t('company_profile.create_quiz') }}
  </button>
  <Modal ref="quizModal"
         :title="t('company_profile.create_quiz')"
         :wide="true">
    <Form @submit="handleQuizCreate"
          :validation-schema="createQuizSchema"
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
      <div>
        <h4 class="mt-5 mb-4">{{ $t('company_profile.questions') }}:</h4>
        <FieldArray
            name="questions"
            v-slot="{ fields, push, remove}"
        >
          <div v-for="(field, idx) in fields"
               :key="field.key"
               class="form-floating mb-5"
          >
            <Field :id="`question_${idx}`"
                   :name="`questions[${idx}].text`"
                   as="textarea"
                   type="text"
                   class="form-control"
                   placeholder="Questjion Text"/>
            <label :for="`question_${idx}`">{{ $t('company_profile.question_text') }}</label>
            <ErrorMessage :name="`questions[${idx}].text`" class="d-flex mt-2 invalid-feedback"/>
            <FieldArray :name="`questions[${idx}].answers`"
                        v-slot="{ fields, push, remove}"
            >
              <ul>
                <li v-for="(answerField, answerIndex) in fields"
                    :key="answerField.key"
                    class="my-2 px-2 position-relative border border-1 rounded">
                  <Field :name="`questions[${idx}].answers[${answerIndex}].text`"
                         type="text"
                         class="form-control-plaintext"
                         :placeholder="t('company_profile.question_text')"/>
                  <ErrorMessage :name="`questions[${idx}].answers[${answerIndex}].text`"
                                class="d-flex mt-2 invalid-feedback"/>
                  <div class="form-check">
                    <Field :id="`question_${idx}_answer_${answerIndex}`"
                           :name="`questions[${idx}].answers[${answerIndex}].is_correct`"
                           :value="true"
                           class="form-check-input"
                           type="checkbox"/>
                    <label class="form-check-label"
                           :for="`question_${idx}_answer_${answerIndex}`"
                    >{{ $t('company_profile.correct') }}</label>
                  </div>
                  <button type="button"
                          class="btn-close delete-answer-btn"
                          @click="remove(answerIndex)"
                          title="Delete Answer"
                  ></button>
                </li>
              </ul>
              <ErrorMessage :name="`questions[${idx}].answers`" class="d-flex mt-2 invalid-feedback"/>
              <button class="btn btn-primary"
                      type="button"
                      @click="push({'text': '', is_correct: false})"
              >{{ $t('company_profile.add_answer') }}
              </button>
            </FieldArray>
            <button class="btn btn-danger ms-2"
                    type="button"
                    @click="remove(idx)"
            >{{ $t('company_profile.delete_question') }}
            </button>
          </div>
          <ErrorMessage name="questions" class="d-flex mt-2 invalid-feedback"/>
          <button type="button"
                  class="mt-4 btn btn-primary w-100"
                  @click="push({text: '', answers: [{text: '', is_correct: false}, {text: '', is_correct: false}]})"
          >{{ $t('company_profile.add_question') }}
          </button>
        </FieldArray>
      </div>
      <button type="submit"
              class="d-flex btn btn-primary px-3 ms-auto mt-3"
      >{{ t('common.create') }}
      </button>
    </Form>
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