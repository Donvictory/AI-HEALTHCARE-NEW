import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "./storage";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the access token to the header
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle errors (like 401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh token fails
    if (
      originalRequest.url?.includes("/users/refresh-token") ||
      originalRequest._retry
    ) {
      if (originalRequest.url?.includes("/users/refresh-token")) {
        clearTokens();
        // window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        clearTokens();
        return Promise.reject(error);
      }

      try {
        // No body needed as refreshToken is in httpOnly cookie
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/users/refresh-token`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = response.data.data || response.data;
        // Even if we don't use it in headers, saving to localStorage might be
        // useful for other legacy parts, but primarily we rely on cookies now.
        saveTokens(accessToken);

        isRefreshing = false;
        processQueue(null, accessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        clearTokens();
        // window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
