import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

const api = axios.create({
  baseURL: API_URL,
});

// Attach the access token to every request.
api.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// A separate client (without the interceptors above and below) is used for the
// refresh call, so a failed refresh can never trigger another refresh.
const refreshClient = axios.create({
  baseURL: API_URL,
});

// If several requests fail at the same time, they share one refresh call.
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    const refreshToken = sessionStorage.getItem("refreshToken");

    refreshPromise = refreshClient
      .post("auth/token/refresh/", { refresh: refreshToken })
      .then((response) => {
        sessionStorage.setItem("accessToken", response.data.access);
        // Only present when the backend rotates refresh tokens.
        if (response.data.refresh) {
          sessionStorage.setItem("refreshToken", response.data.refresh);
        }
        return response.data.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// When the access token has expired, get a new one and repeat the request.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // A wrong password on the login or register screen is not an expired session.
    const isAuthScreenRequest = ["auth/login/", "auth/register/"].some((path) =>
      String(originalRequest?.url || "").includes(path)
    );

    if (status === 401 && originalRequest && !isAuthScreenRequest) {
      const hasRefreshToken = Boolean(sessionStorage.getItem("refreshToken"));

      if (hasRefreshToken && !originalRequest._retried) {
        originalRequest._retried = true;
        try {
          const newAccessToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // The refresh token is also invalid or expired: fall through.
        }
      }

      // The session cannot be renewed. Tell the app to log the user out.
      window.dispatchEvent(new Event("auth-expired"));
    }

    return Promise.reject(error);
  }
);

export default api;