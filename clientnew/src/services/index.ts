import axios from 'axios';

export const $host = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_API_URL,
  withCredentials: true,
});

$host.interceptors.response.use(
  (res) => {
    try {
      const url = res?.config?.url || "";
      if (url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh")) {
        const refreshFromBody = res?.data?.data?.refreshToken || res?.data?.refreshToken;
        if (refreshFromBody) {
          localStorage.setItem("refresh_token", refreshFromBody);
        }
      }
    } catch (e) {
      console.error("Error handling auth response:", e);
    }

    return res;
  },
  async (error) => {
    const original = error.config;

    if (!original) return Promise.reject(error);

    if (error.response?.status === 401 && !original._retry) {
      if (error.response?.data?.message === 'Invalid or expired access token') {
        console.log("REFRESHING TOKEN");
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            document.cookie = 'access_token=; path=/; max-age=0';
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('app_state');
            window.location.href = "/login";
            return Promise.reject(error);
          }

          const { data } = await $host.post("/auth/refresh", { refreshToken });

          const newRefresh = data?.data?.refreshToken || data?.refreshToken;
          if (newRefresh) {
            localStorage.setItem('refresh_token', newRefresh);
          }

          original._retry = true;
          return $host(original);
        } catch (err) {
          document.cookie = 'access_token=; path=/; max-age=0';
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('app_state');
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }
    }

    return Promise.reject(error);
  }
);
