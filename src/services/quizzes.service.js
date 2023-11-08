import apiClient from "@/http/axios/apiClient";

export async function getCompanyQuizzes(companyId) {
  try {
    const {data} = await apiClient.get(`/api/companies/${companyId}/quizzes/`)
    return data
  } catch (error) {
    console.error('API Error:', error)
  }
}

export async function getQuizById(quizId) {
  try {
    const {data} = await apiClient.get(`/api/quizzes/${quizId}/`);
    return data
  } catch (error) {
    console.error('API Error:', error)
  }
}

export async function getQuizLastTakenTime(quizId, userId) {
  try {
    const {data} = await apiClient.get(`/api/quizzes/${quizId}/last-taken-time/?user=${userId}`)
    return data
  } catch (error) {
    console.error('API Error:', error)
  }
}