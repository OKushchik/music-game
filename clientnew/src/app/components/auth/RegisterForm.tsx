'use client'

import React, {useState} from "react";
import styles from "./styles.module.css";
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField
} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/src/store/store';
import { register } from '@/src/store/slices/authSlice';
import { useRouter } from 'next/navigation';

export const RegisterForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.auth.loading);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState({ password: false, confirmPassword: false });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      await dispatch(register({ username: name, email, password, role: adminKey ? 'admin' : 'user', adminKey: adminKey || undefined })).unwrap();
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form className={styles['form']} onSubmit={handleSubmit} autoComplete="off">
      <div className={styles['form__title']}>Register Form</div>
      <div className={styles['form__fields']}>

        <TextField id="name-field" name="name" label="Name" type="text" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} />

        <TextField id="email-field" name="email" label="Email" type="email" autoComplete="email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} />

        <FormControl variant="outlined">
          <InputLabel htmlFor="password-field">Password</InputLabel>
          <OutlinedInput id="password-field" type={showPassword.password ? 'text' : 'password'} endAdornment={<InputAdornment position="end"><IconButton aria-label={showPassword.password ? 'hide the password' : 'display the password'} onClick={() => setShowPassword(prev => ({...prev, password: !prev.password}))} edge="end">{showPassword.password ? <VisibilityOff/> : <Visibility/>}</IconButton></InputAdornment>} label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>

        <FormControl variant="outlined">
          <InputLabel htmlFor="confirm-password-field">Confirm Password</InputLabel>
          <OutlinedInput id="confirm-password-field" type={showPassword.confirmPassword ? 'text' : 'password'} endAdornment={<InputAdornment position="end"><IconButton aria-label={showPassword.confirmPassword ? 'hide the password' : 'display the password'} onClick={() => setShowPassword(prev => ({...prev, confirmPassword: !prev.confirmPassword}))} edge="end">{showPassword.confirmPassword ? <VisibilityOff/> : <Visibility/>}</IconButton></InputAdornment>} label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </FormControl>

        <TextField id="admin-key-field" name="adminKey" label="Admin Key (optional)" type="text" variant="outlined" value={adminKey} onChange={(e)=>setAdminKey(e.target.value)} />

      </div>
      <div className={styles['form__buttons']}>
        <Button type="submit" variant="outlined" disabled={loading}>{loading ? 'Loading...' : 'Register'}</Button>
      </div>
    </form>
  )
}
