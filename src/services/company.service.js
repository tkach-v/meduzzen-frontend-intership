import apiClient from "@/http/axios/apiClient";

export async function fetchCompanyById(companyId) {
  try {
    const {data} = await apiClient.get(`/api/companies/${companyId}/`);
    return data
  } catch (error) {
    console.error('API Error:', error)
  }
}

export async function checkIsUserMember(companyId) {
  try {
    const userId = JSON.parse(localStorage.getItem('user')).id
    const {data} = await apiClient.get(`/api/companies/${companyId}/`)
    return data.members.includes(userId)
  } catch (error) {
    console.error('API Error:', error)
  }
}