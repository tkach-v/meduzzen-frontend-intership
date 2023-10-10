import apiClient from "@/http/axios/apiClient";

const LOGIN_URL = '/api/jwt/create/';
const REGISTER_URL = '/api/users/';
const GET_USER_URL = '/api/users/me/';

class AuthService {
  login(user) {
    return apiClient()
      .post(LOGIN_URL, {
        email: user.email,
        password: user.password
      })
      .then(loginResponse => {
        if (loginResponse.data.access) {
          localStorage.setItem('user', JSON.stringify(loginResponse.data));
          const userTokens = {
            access: loginResponse.data.access,
            refresh: loginResponse.data.refresh
          };

          // Make a GET request to /users/me to get the user info
          return apiClient(userTokens.access)
            .get(GET_USER_URL)
            .then(userInfoResponse => {
              const userData = {...userTokens, ...userInfoResponse.data}
              localStorage.setItem('user', JSON.stringify(userData));
              return userData;
            })
            .catch(error => {
              console.error('Failed to fetch user info:', error);
            });
        }
      });
  }

  logout() {
    localStorage.removeItem('user');
  }

  register(user) {
    return apiClient()
      .post(REGISTER_URL, {
        email: user.email,
        password: user.password
      });
  }
}

export default new AuthService();