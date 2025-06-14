'use client';

import { useRecommendations } from '@/contexts/RecommendationContext';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { mood } = useRecommendations();
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    // Remove any existing mood classes
    body.className = body.className.split(' ').filter(cls => !cls.startsWith('theme-')).join(' ');
    // Add the new mood class if mood is selected
    if (mood) {
      body.classList.add(`theme-${mood}`);
    }
  }, [mood, pathname]); // Add pathname to the dependency array

  return <>{children}</>;
}