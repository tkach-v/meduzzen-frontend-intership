import * as yup from 'yup'

export const userIdSchema = (requiredText) => {
  return yup.object().shape({
    user_id: yup
      .number()
      .required(requiredText)
  })
}
