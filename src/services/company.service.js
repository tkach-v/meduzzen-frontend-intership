import apiClient from "@/http/axios/apiClient";

export async function fetchCompanyById(companyId) {
  try {
    const {data} = await apiClient.get(`/api/companies/${companyId}/`);
    return data
  } catch (error) {
    console.error('API Error:', error)
  }
}