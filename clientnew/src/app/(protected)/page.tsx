'use client'

import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

export default function Home() {
  const router = useRouter();


  return (
    <main>
      <button className={styles['start-button']} onClick={() => router.push('/game')}>
        Start game
      </button>
    </main>
  )
}
