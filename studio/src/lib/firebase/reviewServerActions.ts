
'use server';

import { adminAuth, adminDb } from './adminConfig';
import admin from 'firebase-admin'; // For FieldValue
import { z } from 'zod';

const ContentReviewInputSchema = z.object({
  contentTitle: z.string().min(1, { message: 'Content title is required.' }),
  rating: z.number()
    .min(0.5, { message: 'Rating must be at least 0.5.' })
    .max(10, { message: 'Rating cannot exceed 10.' })
    .refine(val => Number.isInteger(val * 2), { message: 'Rating must be in 0.5 increments (e.g., 7.0, 7.5).' }),
  reviewText: z.string().optional(),
});
export type ContentReviewInput = z.infer<typeof ContentReviewInputSchema>;

const REVIEWS_COLLECTION = 'contentReviews';

export async function addContentReview(
  idToken: string,
  clientUserId: string, // For cross-check, though token is authoritative
  data: ContentReviewInput
): Promise<{ success: boolean; message: string; reviewId?: string }> {
  console.log('[reviewServerActions] addContentReview: SERVER ACTION STARTED');

  if (!adminAuth || !adminDb) {
    console.error('[reviewServerActions] Firebase Admin SDK not initialized correctly.');
    return { success: false, message: 'Server configuration error.' };
  }

  let verifiedUserId: string;
  let userDisplayName: string | null = null;
  let userPhotoURL: string | null = null;

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    verifiedUserId = decodedToken.uid;
    userDisplayName = decodedToken.name || null;
    userPhotoURL = decodedToken.picture || null;
    console.log('[reviewServerActions] ID Token verified successfully for UID:', verifiedUserId, 'Name:', userDisplayName, 'Pic:', userPhotoURL);

    if (clientUserId && verifiedUserId !== clientUserId) {
      console.warn(`[reviewServerActions] Mismatch: clientUserId ('${clientUserId}') and token UID ('${verifiedUserId}'). Using token UID.`);
    }
  } catch (error) {
    console.error('[reviewServerActions] Error verifying ID token:', error);
    return { success: false, message: 'Invalid authentication token.' };
  }

  const parseResult = ContentReviewInputSchema.safeParse(data);
  if (!parseResult.success) {
    const firstErrorMessage = Object.values(parseResult.error.flatten().fieldErrors).flat()[0] || 'Invalid review data.';
    console.error('[reviewServerActions] Invalid review data:', parseResult.error.flatten());
    return { success: false, message: firstErrorMessage };
  }

  const { contentTitle, rating, reviewText } = parseResult.data;

  try {
    const reviewData = {
      userId: verifiedUserId,
      userDisplayName: userDisplayName, 
      userPhotoURL: userPhotoURL,     
      contentTitle,
      rating, // This is now 0.5-10
      reviewText: reviewText || '', 
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(REVIEWS_COLLECTION).add(reviewData);
    console.log('[reviewServerActions] Review added to Firestore with ID:', docRef.id, 'for user:', verifiedUserId);
    return { success: true, message: 'Review submitted successfully!', reviewId: docRef.id };
  } catch (error) {
    console.error('[reviewServerActions] Error adding review to Firestore with Admin SDK:', error);
    if (error instanceof Error) {
      return { success: false, message: `Failed to save review. Server error: ${error.message}` };
    }
    return { success: false, message: 'Failed to save review due to an unknown server error.' };
  }
}
