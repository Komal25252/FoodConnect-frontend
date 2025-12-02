import axios from "axios";

const api = axios.create({
  baseURL: "https://foodconnect-backend-vo3n.onrender.com/api", // updated to correct backend port
  withCredentials: true, // if you're using cookies/JWT
});

// Add request interceptor to automatically include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
