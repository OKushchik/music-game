'use client'

import { useRouter } from 'next/navigation';
import { Button } from "@mui/material";
import { logoutAPI } from "@/src/services/api/authApi";

export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutAPI();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <main>
      <Button onClick={handleLogout}>
        Log Out
      </Button>
    </main>
  )
}
