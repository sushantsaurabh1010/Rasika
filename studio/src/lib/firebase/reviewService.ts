'use client';

// Client-side Firestore service
import { db } from './config';
import { collection, query, where, getDocs, orderBy, limit, doc, deleteDoc, type Timestamp } from 'firebase/firestore';

export interface ReviewEntry {
  id: string; // Firestore document ID
  userId: string;
  userDisplayName?: string | null;
  userPhotoURL?: string | null;
  contentTitle: string;
  rating: number;
  reviewText?: string;
  createdAt: Timestamp | Date;
}

const REVIEWS_COLLECTION = 'contentReviews';

export async function getUserReviews(userId: string, count: number = 20): Promise<ReviewEntry[]> {
  if (!userId) {
    console.warn('[ReviewService] getUserReviews called without userId.');
    return [];
  }
  try {
    const reviewsQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(reviewsQuery);
    const reviews: ReviewEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let createdAtDate: Date;
      if (data.createdAt && typeof (data.createdAt as Timestamp).toDate === 'function') {
        createdAtDate = (data.createdAt as Timestamp).toDate();
      } else if (data.createdAt instanceof Date) {
        createdAtDate = data.createdAt;
      } else {
        console.warn(`[ReviewService] Review ID ${doc.id} has unexpected createdAt format. Using current date as fallback.`);
        createdAtDate = new Date(); 
      }

      reviews.push({
        id: doc.id,
        userId: data.userId,
        userDisplayName: data.userDisplayName || null,
        userPhotoURL: data.userPhotoURL || null,
        contentTitle: data.contentTitle,
        rating: data.rating,
        reviewText: data.reviewText,
        createdAt: createdAtDate,
      });
    });
    return reviews;
  } catch (error) {
    console.error("[ReviewService] Error fetching user reviews:", error);
    if (error instanceof Error && (error as any).code === 'permission-denied') {
        throw new Error('FirebaseError: Missing or insufficient permissions to read reviews. Please check your Firestore security rules for the "contentReviews" collection.');
    }
    throw error;
  }
}

export async function getReviewsForContent(contentTitle: string, count: number = 20): Promise<ReviewEntry[]> {
  console.log(`[ReviewService] getReviewsForContent called for title: "${contentTitle}", count: ${count}`);
  if (!contentTitle || contentTitle.trim() === '') {
    console.warn('[ReviewService] getReviewsForContent called with empty or whitespace-only contentTitle. Returning empty array.');
    return [];
  }
  try {
    const reviewsQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where('contentTitle', '==', contentTitle),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    console.log(`[ReviewService] Executing query for contentTitle: "${contentTitle}"`);
    const querySnapshot = await getDocs(reviewsQuery);
    console.log(`[ReviewService] Query for "${contentTitle}" returned ${querySnapshot.docs.length} documents.`);
    const reviews: ReviewEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let createdAtDate: Date;
      if (data.createdAt && typeof (data.createdAt as Timestamp).toDate === 'function') {
        createdAtDate = (data.createdAt as Timestamp).toDate();
      } else if (data.createdAt instanceof Date) {
        createdAtDate = data.createdAt;
      } else {
        console.warn(`[ReviewService] Public Review ID ${doc.id} has unexpected createdAt format. Using current date as fallback.`);
        createdAtDate = new Date();
      }
      reviews.push({
        id: doc.id,
        userId: data.userId,
        userDisplayName: data.userDisplayName || null,
        userPhotoURL: data.userPhotoURL || null,
        contentTitle: data.contentTitle,
        rating: data.rating,
        reviewText: data.reviewText,
        createdAt: createdAtDate,
      });
    });
    return reviews;
  } catch (error) {
    console.error(`[ReviewService] Error fetching reviews for content "${contentTitle}":`, error);
    if (error instanceof Error && (error as any).code === 'permission-denied') {
        throw new Error(`FirebaseError: Missing or insufficient permissions to read reviews for "${contentTitle}". Please check your Firestore security rules for the "contentReviews" collection.`);
    }
    throw error;
  }
}

// --- Add this function for review deletion ---
export async function deleteReview(reviewId: string) {
  try {
    await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
    return { success: true };
  } catch (error) {
    console.error('[ReviewService] Error deleting review:', error);
    return { success: false, error: (error as Error).message };
  }
}