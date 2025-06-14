'use client';

import type { RecommendationItem } from '@/ai/flows/generate-recommendation';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/AuthContext';

interface RecommendationContextType {
  recommendations: RecommendationItem[] | null;
  setRecommendations: Dispatch<SetStateAction<RecommendationItem[] | null>>;
  currentHistoryDocId: string | null;
  setCurrentHistoryDocId: Dispatch<SetStateAction<string | null>>;
  mood: string | null; // Add this line
  setMood: Dispatch<SetStateAction<string | null>>; // Add this line
}

const RecommendationContext = createContext<RecommendationContextType | undefined>(undefined);

export function RecommendationProvider({ children }: { children: ReactNode }) {
  const [recommendations, setRecommendationsState] = useState<RecommendationItem[] | null>(null);
  const [currentHistoryDocId, setCurrentHistoryDocId] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();

  // Clear recommendations and history doc ID when user logs out or changes
  useEffect(() => {
    if (!authLoading && !user) {
      setRecommendationsState(null);
      setCurrentHistoryDocId(null);
    }
  }, [user, authLoading]);

  const setRecommendationsWithLog: Dispatch<SetStateAction<RecommendationItem[] | null>> = (valueOrFn) => {
    setRecommendationsState(prev => {
      const newValue = typeof valueOrFn === 'function'
        ? (valueOrFn as (prevState: RecommendationItem[] | null) => RecommendationItem[] | null)(prev)
        : valueOrFn;
      console.log('[RecommendationProvider] setRecommendations. Prev state:', prev ? `Array[${prev.length}]` : prev, 'New state:', newValue ? `Array[${newValue.length}]` : newValue);
      return newValue;
    });
  };

  const setCurrentHistoryDocIdWithLog: Dispatch<SetStateAction<string | null>> = (valueOrFn) => {
    setCurrentHistoryDocId(prev => {
      const newValue = typeof valueOrFn === 'function' ? valueOrFn(prev) : valueOrFn;
      console.log('[RecommendationProvider] setCurrentHistoryDocId. Prev ID:', prev, 'New ID:', newValue);
      return newValue;
    });
  };

  return (
    <RecommendationContext.Provider value={{
      recommendations,
      setRecommendations: setRecommendationsWithLog,
      currentHistoryDocId,
      setCurrentHistoryDocId: setCurrentHistoryDocIdWithLog,
      mood,
      setMood,
    }}>
      {children}
    </RecommendationContext.Provider>
  );
}

export function useRecommendations(): RecommendationContextType {
  const context = useContext(RecommendationContext);
  if (context === undefined) {
    throw new Error('useRecommendations must be used within a RecommendationProvider');
  }
  return context;
}