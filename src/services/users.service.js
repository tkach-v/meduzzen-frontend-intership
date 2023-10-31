import apiClient from "@/http/axios/apiClient";

export async function fetchUserById(userId) {
  try {
    const {data} = await apiClient.get(`/api/users/${userId}/`);
    return data
  } catch (error) {
    console.error('API Error:', error)
  }
}