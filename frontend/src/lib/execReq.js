// import axios from "axios";

// export const API_BASE_URL = String(
//   import.meta.env.VITE_API_URL || "http://localhost:5000/api",
// ).replace(/\/+$/, "");

// export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

// const client = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 20000,
// });

// const getToken = () =>
//   localStorage.getItem("hrms_token") ||
//   localStorage.getItem("token") ||
//   sessionStorage.getItem("token");

// client.interceptors.request.use(
//   (config) => {
//     const token = getToken();
//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// client.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error?.response?.status === 401) {
//       ["token", "hrms_token", "refreshToken", "hrms_refresh_token"].forEach((key) => {
//         localStorage.removeItem(key);
//         sessionStorage.removeItem(key);
//       });
//       if (window.location.pathname !== "/") {
//         window.location.href = "/";
//       }
//     }
//     return Promise.reject(error);
//   },
// );

// /**
//  * Central HRMS request helper.
//  * GET can be used directly: execReq("/attendance?date=2026-09-18")
//  * Other verbs stay available as familiar helpers: execReq.post(...), etc.
//  */
// const execReq = (url, config = {}) => client.get(url, config);

// execReq.get = (url, config = {}) => client.get(url, config);
// execReq.post = (url, data, config = {}) => client.post(url, data, config);
// execReq.put = (url, data, config = {}) => client.put(url, data, config);
// execReq.patch = (url, data, config = {}) => client.patch(url, data, config);
// execReq.delete = (url, config = {}) => client.delete(url, config);
// execReq.request = (config) => client.request(config);
// execReq.client = client;

// export default execReq;
import axios from "axios";

export const API_BASE_URL = String(
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/+$/, "");

export const SOCKET_BASE_URL =
  API_BASE_URL.replace(/\/api\/?$/, "") || window.location.origin;

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

const getToken = () =>
  localStorage.getItem("hrms_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("hrms_token") ||
  sessionStorage.getItem("token");

const getRefreshToken = () =>
  localStorage.getItem("hrms_refresh_token") ||
  localStorage.getItem("refreshToken") ||
  sessionStorage.getItem("hrms_refresh_token") ||
  sessionStorage.getItem("refreshToken");

const clearAuth = () => {
  ["token", "hrms_token", "refreshToken", "hrms_refresh_token", "rememberMe"].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  localStorage.removeItem("hrms_user");
  sessionStorage.removeItem("hrms_user");
};

const storeTokens = ({ accessToken, refreshToken }) => {
  const storage = localStorage.getItem("rememberMe") === "true" ? localStorage : sessionStorage;
  if (accessToken) {
    storage.setItem("token", accessToken);
    storage.setItem("hrms_token", accessToken);
  }
  if (refreshToken) {
    storage.setItem("refreshToken", refreshToken);
    storage.setItem("hrms_refresh_token", refreshToken);
  }
};

client.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error?.config;
    const path = String(request?.url || "");
    const isAuthRequest = path.includes("/auth/login") || path.includes("/auth/refresh-token");

    // Invalid credentials must be shown by Login.jsx, not treated as an
    // expired session. Protected requests refresh once before signing out.
    if (error?.response?.status !== 401 || !request || isAuthRequest || request._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (refreshToken) {
      request._retry = true;
      try {
        refreshPromise ||= client.post("/auth/refresh-token", { refreshToken });
        const response = await refreshPromise;
        const payload = response?.data?.data || response?.data || {};
        if (!payload.accessToken) throw new Error("Refresh response is missing an access token.");
        storeTokens(payload);
        request.headers = request.headers || {};
        request.headers.Authorization = `Bearer ${payload.accessToken}`;
        return client(request);
      } catch {
        clearAuth();
      } finally {
        refreshPromise = null;
      }
    } else {
      clearAuth();
    }

    if (window.location.pathname !== "/") window.location.assign("/");
    return Promise.reject(error);
  }
);

/**
 * Central HRMS request helper.
 *
 * GET:
 *   execReq("/attendance?date=2026-09-18")
 *
 * Other verbs:
 *   execReq.post(...)
 *   execReq.put(...)
 *   execReq.patch(...)
 *   execReq.delete(...)
 */

const execReq = (url, config = {}) => client.get(url, config);

execReq.get = (url, config = {}) => client.get(url, config);

execReq.post = (url, data, config = {}) =>
  client.post(url, data, config);

execReq.put = (url, data, config = {}) =>
  client.put(url, data, config);

execReq.patch = (url, data, config = {}) =>
  client.patch(url, data, config);

execReq.delete = (url, config = {}) =>
  client.delete(url, config);

execReq.request = (config) => client.request(config);

execReq.client = client;

export default execReq;
