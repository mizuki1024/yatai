// src/app/page.tsx
"use client"; // クライアントコンポーネントとしてマーク

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // next/router ではなく next/navigation を使用

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/select-user-type');
  }, [router]);

  return null; // Render nothing as we are redirecting
}
