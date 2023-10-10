import apiClient from "@/http/axios/apiClient";
const user = JSON.parse(localStorage.getItem('user'));

class UserService {
  getUsers() {
    return apiClient(user.access).get('/api/users/');
  }
}

export default new UserService();