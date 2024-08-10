import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://your-api-url.com',
  timeout: 1000,
});

export default instance;
