<script setup>
import {defineProps, ref} from "vue";
import {useI18n} from "vue-i18n";
import {ErrorMessage, Field, Form} from "vee-validate";
import Modal from "@/components/Modal.vue";
import * as yup from "yup";
import apiClient from "@/http/axios/apiClient";
import {toast} from "vue3-toastify";

const props = defineProps({
  companyId: Number
})

const {t} = useI18n()

const importQuizModal = ref(null);

const importQuizSchema = yup.object().shape({
  excel_file: yup
      .mixed()
      .required(t('company_profile.excel_file_required'))
});
const handleImportQuiz = async (quizData) => {
  try {
    apiClient.interceptors.request.use(
        (config) => {
          config.headers["Content-Type"] = 'multipart/form-data'
          return config;
        }
    );
    await apiClient.post(`/api/companies/${props.companyId}/import-quiz/`, quizData)
    toast.success(t('company_profile.import_quiz_success'))
  } catch (err) {
    toast.error("Error: " + err.response.data.detail)
  }
};

function showImportQuizModal() {
  importQuizModal.value.show();
}
</script>

<template>
  <button class="btn btn-primary ms-2"
          type="button"
          @click="showImportQuizModal"
  >{{ $t('company_profile.import_data') }}
  </button>
  <Modal ref="importQuizModal"
         :title="t('company_profile.import_data')">
    <Form @submit="handleImportQuiz"
          :validation-schema="importQuizSchema"
          enctype="multipart/form-data">
      <Field name="excel_file"
             type="file"
             class="form-control"/>
      <ErrorMessage name="excel_file" class="d-flex my-2 invalid-feedback"/>
      <button class="d-flex btn btn-primary px-3 ms-auto mt-3">{{ $t('company_profile.import') }}</button>
    </Form>
  </Modal>
</template>