
'use client';

import { useRecommendations } from '@/contexts/RecommendationContext';
import { useEffect } from 'react';
// Removed pathname import as it's no longer used in the effect's dependencies directly for class manipulation
import { useTheme } from 'next-themes';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { mood } = useRecommendations();
  const { theme: activeTheme, systemTheme } = useTheme(); // Get the active theme from next-themes
  // Pathname removed from dependencies as it's not directly deciding theme class names here

  useEffect(() => {
    const body = document.body;

    // Remove only mood-specific theme classes from body
    // This ensures that when the mood changes or is cleared, old mood classes are gone.
    const moodClassesOnBody = Array.from(body.classList).filter(cls => cls.startsWith('theme-'));
    if (moodClassesOnBody.length > 0) {
      body.classList.remove(...moodClassesOnBody);
    }

    // Add the new mood class to body if a mood is selected
    // This layers on top of the base light/dark theme set on <html> by next-themes.
    if (mood) {
      body.classList.add(`theme-${mood}`);
    }

    // Dependencies:
    // - mood: If the mood changes, we need to update the body class.
    // - activeTheme/systemTheme: If the base theme (light/dark) changes, this effect re-runs.
    //   While mood themes currently don't have dark variants, if they did, this would be crucial.
    //   For now, it ensures that if a mood is active and user toggles dark/light, the mood class
    //   is correctly reapplied (though it will still visually be the mood's own palette).
  }, [mood, activeTheme, systemTheme]);

  return <>{children}</>;
}
