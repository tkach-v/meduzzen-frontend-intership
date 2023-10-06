import axios from 'axios';

export default (token = '') => axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: token ? {Authorization: `JWT ${token}`} : {},
});
