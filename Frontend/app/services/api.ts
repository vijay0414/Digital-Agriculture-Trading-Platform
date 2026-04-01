import axios from "axios";

const api = axios.create({
  baseURL: "https://gateway-service-production-37b5.up.railway.app", // Corrected to local gateway port
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach auth token if available automatically
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  // Debugging: Verify token presence before each request
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  console.log("Token:", token ? "Present (Bearer ...)" : "Missing");

  if (token) {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
