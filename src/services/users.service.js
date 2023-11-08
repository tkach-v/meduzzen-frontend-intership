import apiClient from "@/http/axios/apiClient";

export async function fetchUserById(userId) {
  try {
    const {data} = await apiClient.get(`/api/users/${userId}/`);
    return data
  } catch (error) {
    console.error('API Error:', error)
  }
}

export async function getUserRating(userId) {
  try {
    const {data} = await apiClient.get(`/api/quizzes/user-score/?user=${userId}`);
    return data.average_score
  } catch (error) {
    console.error('API Error:', error)
  }
}