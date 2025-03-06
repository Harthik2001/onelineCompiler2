// client/src/auth.js
import axios from 'axios';

const API_URL = '{process.env.REACT_APP_BACKEND_URL}/api/auth';   //changed

export const signup = async (fullname, email, password) => {
  const response = await axios.post(`${API_URL}/signup`, { fullname, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};
