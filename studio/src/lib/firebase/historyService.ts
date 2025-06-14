
// This file contains functions intended to be called from CLIENT components.
// It uses the CLIENT-SIDE Firebase SDK.
// DO NOT add 'use server'; here.
// DO NOT import 'firebase-admin' or './adminConfig' here.

import { db } from './config'; // Client-side Firestore instance
import { collection, query, where, getDocs, orderBy, limit, type Timestamp } from 'firebase/firestore';
import type { GenerateRecommendationInput, RecommendationItem } from '@/ai/flows/generate-recommendation';

// This interface now reflects that the document stores the request details
// and an array of specific items the user viewed from that request.
export interface HistoryEntry extends GenerateRecommendationInput {
  userId: string;
  createdAt: Timestamp | Date; // Allow Date for client-side processing
  viewedRecommendations?: RecommendationItem[]; // Renamed from 'recommendations' and made optional
  id?: string; // Document ID from Firestore
  // language is part of GenerateRecommendationInput, so it's implicitly included
}

const HISTORY_COLLECTION = 'userHistory';

export async function getUserHistory(userId: string, count: number = 10): Promise<HistoryEntry[]> {
  console.log(`[historyService (Client)] getUserHistory: Attempting to fetch history for userId: ${userId}, count: ${count}`);
  if (!userId) {
    console.warn('[historyService (Client)] getUserHistory: No userId provided. Returning empty array.');
    return [];
  }
  try {
    console.log(`[historyService (Client)] getUserHistory: Constructing query for collection '${HISTORY_COLLECTION}' where 'userId' == '${userId}'.`);
    const historyQuery = query(
      collection(db, HISTORY_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(count)
    );

    console.log('[historyService (Client)] getUserHistory: Executing Firestore query...');
    const querySnapshot = await getDocs(historyQuery);
    console.log(`[historyService (Client)] getUserHistory: Query successful. Found ${querySnapshot.docs.length} documents for userId: ${userId}`);

    const history: HistoryEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let createdAtDate: Date | Timestamp = new Date(); 
      if (data.createdAt) {
        createdAtDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      }

      const entryBase: Omit<HistoryEntry, 'viewedRecommendations' | 'id' | 'createdAt' | 'language' | 'imdbRatingFilter'> & { language?: string; imdbRatingFilter?: string } = {
        userId: data.userId,
        mood: data.mood,
        contentTypes: data.contentTypes,
        keywords: data.keywords,
        imdbRatingFilter: data.imdbRatingFilter === null ? undefined : data.imdbRatingFilter,
        language: data.language === null ? undefined : data.language,
      };

      const viewedItems = data.viewedRecommendations?.map((rec: any) => ({
        title: rec.title ?? '',
        contentType: rec.contentType ?? 'unknown',
        summary: rec.summary ?? '',
        releaseYear: rec.releaseYear === undefined ? null : rec.releaseYear,
        // imageUrl removed
        rating: rec.rating === undefined ? null : rec.rating,
        ratingSource: rec.ratingSource === undefined ? null : rec.ratingSource,
        streamingInfo: rec.streamingInfo === undefined ? null : rec.streamingInfo,
        director: rec.director === undefined ? null : rec.director,
        cast: rec.cast === undefined ? null : rec.cast,
        author: rec.author === undefined ? null : rec.author,
        artist: rec.artist === undefined ? null : rec.artist,
        creatorOrHost: rec.creatorOrHost === undefined ? null : rec.creatorOrHost,
        keyCreatorForSimilar: rec.keyCreatorForSimilar === undefined ? null : rec.keyCreatorForSimilar,
      })) || [];

      history.push({
        ...entryBase,
        id: doc.id,
        createdAt: createdAtDate,
        viewedRecommendations: viewedItems,
      } as HistoryEntry); 
    });
    console.log(`[historyService (Client)] getUserHistory: Processed ${history.length} history entries for userId: ${userId}.`);
    return history;
  } catch (error) {
    console.error('[historyService (Client)] getUserHistory: Error during Firestore query execution or data processing:', error);
    if (error instanceof Error && (error as any).code === 'permission-denied') {
        throw new Error('FirebaseError: Missing or insufficient permissions.');
    } else if (error instanceof Error) {
        throw new Error(`Failed to fetch user history. Original error: ${error.message}`);
    }
    throw new Error('Failed to fetch user history due to an unknown error.');
  }
}

