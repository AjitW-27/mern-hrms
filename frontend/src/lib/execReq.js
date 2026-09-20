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
  sessionStorage.getItem("token");

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

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      ["token", "hrms_token", "refreshToken", "hrms_refresh_token"].forEach(
        (key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        }
      );

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

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