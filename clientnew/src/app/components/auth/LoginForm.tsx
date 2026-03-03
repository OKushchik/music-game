'use client'
import React, {useState} from "react";
import {Button, TextField} from "@mui/material";
import styles from './styles.module.css'
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/src/store/store';
import { login } from '@/src/store/slices/authSlice';
import {useRouter} from "next/navigation";

export const LoginForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.auth.loading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form className={styles['form']} onSubmit={handleSubmit} autoComplete="off">
      <div className={styles['form__title']}>Login Form</div>
      <div className={styles['form__fields']}>
        <TextField
          id="email-field"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          id="password-field"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className={styles['form__buttons']}>
        <Button type="submit" variant="outlined" disabled={loading}>{loading ? 'Loading...' : 'Log in'}</Button>
      </div>
    </form>
  )
}
