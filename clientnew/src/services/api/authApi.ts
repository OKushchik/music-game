import { $host } from '../index';
import { UserLogin, UserRegister } from '@/src/models/models';

export const loginAPI = async (obj: UserLogin) => {
  try {
    const { data } = await $host.post('auth/login', { ...obj }, { withCredentials: true });
    return data;
  } catch (err: any) {
    throw err;
  }
}

export const getCurrentUser = async () => {
  try {
    const { data } = await $host.get('auth/me', { withCredentials: true });
    return data;
  } catch (err: any) {
    throw err;
  }
}

export const registerAPI = async (obj: UserRegister) => {
  try {
    const { data } = await $host.post('auth/register', { ...obj }, { withCredentials: true });
    return data;
  } catch (err: any) {
    throw err;
  }
}

export const logoutAPI = async () => {
  try {
    document.cookie = 'access_token=; path=/; max-age=0';
    const { data } = await $host.post('auth/logout', {}, { withCredentials: true });
    return data;
  } catch (err: any) {
    throw err;
  }
}
