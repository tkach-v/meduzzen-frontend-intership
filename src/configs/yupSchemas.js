import * as yup from 'yup'
import i18n from "@/i18n";

const {t} = i18n.global


export const userIdSchema = (requiredText) => {
  return yup.object().shape({
    user_id: yup
      .number()
      .required(requiredText)
  })
}

export const questionSchema = yup.object().shape({
  text: yup.string().required(t('company_profile.text_required')),
  answers: yup.array().of(
    yup.object().shape({
      text: yup.string().required(t('company_profile.text_required')),
      is_correct: yup.boolean()
    })
  ).strict()
    .min(2, t('company_profile.min_2_answers'))
    .test('at-least-one-correct', t('company_profile.min_1_correct'), function (value) {
      // Check if at least one answer has is_correct set to true
      return value && value.some(answer => answer.is_correct === true);
    })
})

export const quizSchema = yup.object().shape({
  title: yup
    .string()
    .required(t('company_profile.quiz_title_required')),
  description: yup
    .string()
    .required(t('company_profile.quiz_description_required')),
  frequency: yup
    .number()
    .required(t('company_profile.quiz_frequency_required')),
})

export const createQuizSchema = yup.object().shape({
  ...quizSchema.fields,
  questions: yup.array().of(
    questionSchema
  ).strict().min(2, t('company_profile.min_2_questions'))
})