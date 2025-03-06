// client/src/api.js
import axios from 'axios';

const API_URL = `{process.env.REACT_APP_BACKEND_URL}/api`;

// Utility function to get token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Execute code API call
export const executeCode = async (language, code, userInput) => {
  console.log("Token inside api.js:", localStorage.getItem('token')); // Debug log
  const response = await axios.post(
    `${API_URL}/code/execute`,
    { language, code, userInput },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// // Get code execution history API call
// export const getHistory = async () => {
//   console.log("Token inside api.js:", localStorage.getItem('token')); 
//   const response = await axios.get(`${API_URL}/code/history`, {
//     headers: getAuthHeaders(),
//     // withCredentials: true,  // ✅ Include this to ensure cookies & credentials are sent
//   });
//   return response.data;
// };





