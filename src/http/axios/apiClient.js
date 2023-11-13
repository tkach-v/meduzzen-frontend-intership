import axios from 'axios';
import TokenService from "@/services/token.service";
import store from "@/store";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

apiClient.interceptors.request.use(
  (config) => {
    const token = TokenService.getLocalAccessToken();
    if (token) {
      config.headers["Authorization"] = 'JWT ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;

    if (originalConfig.url !== "/api/jwt/create/" && err.response) {
      // Access Token was expired, update it
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          const rs = await apiClient.post("/api/jwt/refresh/", {
            refresh: TokenService.getLocalRefreshToken(),
          });

          const {access} = rs.data;

          if (!access) {
            await store.dispatch('auth/logout')
            return Promise.reject()
          }

          await store.dispatch('auth/refreshToken', access);
          TokenService.updateLocalAccessToken(access);
          return apiClient(originalConfig);
        } catch (_error) {
          return Promise.reject(_error);
        }
      }
    }

    return Promise.reject(err);
  }
);

export default apiClient