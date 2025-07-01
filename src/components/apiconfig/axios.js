import axios from "axios";

const API_BASE_URL = "https://crm-tellecallers.onrender.com/"; 

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

// https://crm-tellecallers.onrender.com/
// http://localhost:8000/