import axios from 'axios';

export const $host = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_API_URL,
  withCredentials: true,
});

$host.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {

      if(error.response?.data.message === 'Invalid or expired access token') {
        console.log("REFRESHING TOKEN");
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          const newRefreshToken = await $host.post("/auth/refresh", { refreshToken });
          console.log("TOKEN REFRESHED",newRefreshToken);
          console.log("TOKEN REFRESHED",newRefreshToken.data.refreshToken);
          localStorage.setItem('refresh_token',newRefreshToken.data.refreshToken);
          original._retry = true;
          return $host(original);
        } catch {
          document.cookie = 'access_token=; path=/; max-age=0';
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('app_state');
          return Promise.reject(error);
        }
      }


    }

    return Promise.reject(error);
  }
);

