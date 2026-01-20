export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister extends UserLogin {
  username: string;
  role?: 'user' | 'admin';
  adminKey?: string;
}

export interface User {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  refreshToken?: string;
}

export interface Song {
  _id?: string;
  title: string;
  year: number;
  link: string;
  createdAt?: string;
}

export interface IResponseAllSongs {
  success: boolean;
  message: string;
  data: Song[];
}

export interface IResponseAddSong {
  success: boolean;
  message: string;
  data: Song;
}

export interface IResponseRemoveSong {
  success: boolean;
  message: string;
  data: Song;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface IResponseAllUsers {
  success: boolean;
  message: string;
  data: User[];
}

export const formTypes = {
  LOGIN: 'login',
  REGISTER: 'register',
} as const;

export type FormType = typeof formTypes[keyof typeof formTypes];
