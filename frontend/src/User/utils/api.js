import axios from "axios";

// Base axios instance
const api = axios.create({
  baseURL: "/api/v1", // relative path for production
  withCredentials: true, // cookies भेजने के लिए
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - auto refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.get("/api/v1/refresh-token", {
          withCredentials: true, // cookies auto sent
        });

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        window.location.href = "/login"; // redirect if refresh fails
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
