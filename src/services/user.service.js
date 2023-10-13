import apiClient from "@/http/axios/apiClient";
const user = JSON.parse(localStorage.getItem('user'));

class UserService {
  getUsers() {
    return apiClient.get('/api/users/');
  }
}

export default new UserService();