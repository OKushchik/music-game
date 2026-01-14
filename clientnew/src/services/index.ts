import axios from 'axios';

export const $host = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_API_URL,
  withCredentials: true,
});

const $refresh = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_API_URL,
  withCredentials: true,
});

$host.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {

      if (error.response?.data?.code === "REFRESH_EXPIRED") {
        document.cookie = 'access_token=; path=/; max-age=0';
        return Promise.reject(error);
      }

      original._retry = true;
      try {
        await $refresh.post("/auth/refresh");
        return $host(original);
      } catch {
        document.cookie = 'access_token=; path=/; max-age=0';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

