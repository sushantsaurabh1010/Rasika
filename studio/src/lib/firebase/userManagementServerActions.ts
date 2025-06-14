'use server';

import { adminAuth, adminDb } from './adminConfig';
import admin from 'firebase-admin'; // For FieldValue

/**
 * Retrieves the email associated with a given username.
 * Usernames are stored in lowercase.
 */
export async function getEmailFromUsername(username: string): Promise<{ email: string | null; error?: string }> {
  if (!adminDb) {
    return { email: null, error: 'Server configuration error (Admin DB).' };
  }
  if (!username || username.trim() === '') {
    return { email: null, error: 'Username cannot be empty.' };
  }

  const lowerCaseUsername = username.toLowerCase();

  try {
    const usernameDocRef = adminDb.collection('usernames').doc(lowerCaseUsername);
    const docSnap = await usernameDocRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      return { email: data?.email ?? null, error: undefined };
    } else {
      return { email: null, error: 'Username not found.' };
    }
  } catch (error) {
    return { email: null, error: `Failed to retrieve user data. ${(error as Error).message}` };
  }
}

/**
 * Creates a username entry in Firestore, ensuring username uniqueness.
 * Called during user sign-up.
 */
export async function createUsernameEntry(
  idToken: string,
  clientUserId: string,
  username: string,
  email: string
): Promise<{ success: boolean; message: string }> {
  if (!adminAuth || !adminDb) {
    return { success: false, message: 'Server configuration error (Admin SDK).' };
  }

  let verifiedUserId: string;
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    verifiedUserId = decodedToken.uid;
    if (clientUserId && verifiedUserId !== clientUserId) {
      console.warn(`[userManagementServerActions] User ID mismatch. Token UID: ${verifiedUserId}, Client UID: ${clientUserId}. Using token UID.`);
    }
  } catch (error) {
    return { success: false, message: 'Invalid authentication token.' };
  }

  const lowerCaseUsername = username.toLowerCase();

  // Username validation
  if (lowerCaseUsername.length < 3 || /\s/.test(lowerCaseUsername) || !/^[a-z0-9_]+$/.test(lowerCaseUsername)) {
    return { success: false, message: "Username must be at least 3 characters, lowercase, and contain only letters, numbers, or underscores." };
  }

  const usernameDocRef = adminDb.collection('usernames').doc(lowerCaseUsername);

  try {
    await adminDb.runTransaction(async (transaction) => {
      const usernameDoc = await transaction.get(usernameDocRef);
      if (usernameDoc.exists) {
        throw new Error('Username is already taken. Please choose another.');
      }
      transaction.set(usernameDocRef, {
        userId: verifiedUserId,
        email: email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    return { success: true, message: 'Username registered successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to register username due to a server error.' };
  }
}