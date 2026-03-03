"use client";

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname } from 'next/navigation';
import { fetchCurrentUser } from "@/src/store/slices/authSlice";
import type { AppDispatch, RootState } from "@/src/store/store";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isInitialized } = useSelector((s: RootState) => s.auth);
  const pathname = usePathname();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const isAuthPage = pathname === '/login' || pathname === '/register';
    if (isAuthPage) return;

    if (!isInitialized) dispatch(fetchCurrentUser());
  }, [isInitialized, dispatch]);

  return <>{children}</>;
}
