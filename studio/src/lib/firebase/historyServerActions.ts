
'use server';

// This file contains SERVER ACTIONS.
// It uses the FIREBASE ADMIN SDK.

import { adminAuth, adminDb } from './adminConfig';
import admin from 'firebase-admin'; // Direct import for admin.firestore.FieldValue
import type { GenerateRecommendationInput, RecommendationItem } from '@/ai/flows/generate-recommendation';

// This interface defines the structure of the data for the initial history request.
// It will also be the base for what's fetched, with viewedItems added.
// It now directly uses GenerateRecommendationInput for the request part.
export interface HistoryRequestData extends GenerateRecommendationInput {
  userId: string;
  createdAt: admin.firestore.Timestamp;
  // viewedRecommendations is added dynamically when user views content
}

const HISTORY_COLLECTION = 'userHistory';

// Saves the recommendation request parameters, including personalization data if provided.
// Does NOT save the AI's generated recommendations initially.
// Returns the ID of the newly created history document.
export async function addHistoryRequest(
  idToken: string,
  clientUserId: string,
  inputData: GenerateRecommendationInput // This now includes optional watchedContent and pastRequests
): Promise<{ success: boolean; message: string; historyDocId?: string }> {
  console.log('--- [historyServerActions] addHistoryRequest: SERVER ACTION STARTED ---');

  if (!adminAuth || !adminDb) {
    console.error('[historyServerActions] Firebase Admin SDK not initialized correctly.');
    return { success: false, message: 'Firebase Admin SDK not initialized on the server.' };
  }

  let verifiedUserId: string;
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    verifiedUserId = decodedToken.uid;
    console.log('[historyServerActions] ID Token verified successfully for UID:', verifiedUserId);

    if (clientUserId && verifiedUserId !== clientUserId) {
      console.warn(`[historyServerActions] Mismatch: clientUserId ('${clientUserId}') and token UID ('${verifiedUserId}'). Using token UID.`);
    }
  } catch (error) {
    console.error('[historyServerActions] Error verifying ID token:', error);
    return { success: false, message: 'Invalid authentication token.' };
  }

  try {
    // Prepare the payload for Firestore.
    // Ensure all fields from GenerateRecommendationInput are handled,
    // converting undefined to null where appropriate for Firestore.
    const historyRequestPayload: HistoryRequestData = {
      userId: verifiedUserId,
      mood: inputData.mood ?? '',
      contentTypes: inputData.contentTypes ?? [],
      keywords: inputData.keywords ?? '',
      imdbRatingFilter: inputData.imdbRatingFilter === undefined ? null : inputData.imdbRatingFilter,
      language: inputData.language === undefined ? null : inputData.language,
      // Personalization data
      watchedContent: inputData.watchedContent || [], // Store as empty array if undefined
      pastRequests: inputData.pastRequests || [],   // Store as empty array if undefined
      createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
    };

    const docRef = await adminDb.collection(HISTORY_COLLECTION).add(historyRequestPayload);
    console.log('[historyServerActions] History request added to Firestore with ID:', docRef.id, 'for user:', verifiedUserId);
    return { success: true, message: "History request saved.", historyDocId: docRef.id };
  } catch (error) {
    console.error('[historyServerActions] Error adding history request to Firestore with Admin SDK:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Firestore error.';
    return { success: false, message: `Failed to save history request. ${errorMessage}` };
  }
}

// Adds a specific clicked/viewed recommendation to an existing history document.
export async function addViewedRecommendationToHistory(
  idToken: string,
  clientUserId: string,
  historyDocId: string,
  itemToAdd: RecommendationItem
): Promise<{ success: boolean; message: string }> {
  console.log(`--- [historyServerActions] addViewedRecommendationToHistory: Adding item to historyDocId ${historyDocId} ---`);

  if (!adminAuth || !adminDb) {
    console.error('[historyServerActions] Firebase Admin SDK not initialized.');
    return { success: false, message: 'Server configuration error.' };
  }
  if (!historyDocId || !itemToAdd) {
    console.error('[historyServerActions] Missing historyDocId or itemToAdd.');
    return { success: false, message: 'Missing required parameters.' };
  }

  let verifiedUserId: string;
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    verifiedUserId = decodedToken.uid;
    if (clientUserId && verifiedUserId !== clientUserId) {
      console.warn(`[historyServerActions] User ID mismatch in addViewedRecommendationToHistory. Token UID: ${verifiedUserId}, Client UID: ${clientUserId}`);
    }
  } catch (error) {
    console.error('[historyServerActions] Error verifying ID token for addViewedRecommendationToHistory:', error);
    return { success: false, message: 'Invalid authentication token.' };
  }

  try {
    const historyDocRef = adminDb.collection(HISTORY_COLLECTION).doc(historyDocId);
    
    // Sanitize the item before adding to prevent any undefined values that Firestore might reject
    const sanitizedItem: RecommendationItem = {
        title: itemToAdd.title ?? 'Untitled',
        contentType: itemToAdd.contentType ?? 'unknown',
        summary: itemToAdd.summary ?? 'No summary.',
        releaseYear: itemToAdd.releaseYear === undefined ? null : itemToAdd.releaseYear,
        rating: itemToAdd.rating === undefined ? null : itemToAdd.rating,
        ratingSource: itemToAdd.ratingSource === undefined ? null : itemToAdd.ratingSource,
        streamingInfo: itemToAdd.streamingInfo === undefined ? null : itemToAdd.streamingInfo,
        director: itemToAdd.director === undefined ? null : itemToAdd.director,
        cast: itemToAdd.cast === undefined ? null : itemToAdd.cast,
        author: itemToAdd.author === undefined ? null : itemToAdd.author,
        artist: itemToAdd.artist === undefined ? null : itemToAdd.artist,
        creatorOrHost: itemToAdd.creatorOrHost === undefined ? null : itemToAdd.creatorOrHost,
        keyCreatorForSimilar: itemToAdd.keyCreatorForSimilar === undefined ? null : itemToAdd.keyCreatorForSimilar,
    };

    // Use arrayUnion to add the item.
    // We also need to ensure viewedRecommendations field exists, initialize if not.
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(historyDocRef);
      if (!doc.exists) {
        throw new Error("History document not found.");
      }
      let currentViewed = doc.data()?.viewedRecommendations || [];
      // Simple check to avoid exact duplicates if desired (based on title and type)
      const alreadyExists = currentViewed.some(
        (existingItem: RecommendationItem) => 
          existingItem.title === sanitizedItem.title && 
          existingItem.contentType === sanitizedItem.contentType
      );
      if (!alreadyExists) {
        transaction.update(historyDocRef, {
          viewedRecommendations: admin.firestore.FieldValue.arrayUnion(sanitizedItem)
        });
      } else {
        console.log(`[historyServerActions] Item "${itemToAdd.title}" already in viewedRecommendations for history doc ${historyDocId}. Not adding again.`);
      }
    });


    console.log(`[historyServerActions] Item "${itemToAdd.title}" processed for viewedRecommendations in history doc ${historyDocId}.`);
    return { success: true, message: 'Recommendation view recorded.' };
  } catch (error) {
    console.error(`[historyServerActions] Error updating history doc ${historyDocId} with viewed item:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Firestore error during update.';
    return { success: false, message: `Failed to record view. ${errorMessage}` };
  }
}
