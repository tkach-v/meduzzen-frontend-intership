import axios from 'axios';

export default (token='') => {
  const options = {};

  options.baseURL = import.meta.env.VITE_API_BASE_URL

  // Add token if exists
  if (token) {
    options.headers.Authorization = `JWT ${token}`
  }
  return axios.create(options);
};