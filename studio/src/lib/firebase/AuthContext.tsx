
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  type User,
  type AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getEmailFromUsername, createUsernameEntry } from './userManagementServerActions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSettingUpNewProfile: boolean;
  signInWithEmailPassword: (emailOrUsername: string, pass: string, rememberMe?: boolean) => Promise<void>;
  signUpWithEmailPassword: (email: string, pass: string, username: string, rememberMe?: boolean) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingRedirectState, setIsProcessingRedirectState] = useState(true); // Start as true
  const [isSettingUpNewProfile, setIsSettingUpNewProfile] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    console.log(`[AuthContext] useEffect RUNS. isProcessingRedirectState (current): ${isProcessingRedirectState}`);

    const isProcessingRedirectListener = isProcessingRedirectState;
    console.log(`[AuthContext] useEffect: isProcessingRedirectListener (captured for onAuthStateChanged): ${isProcessingRedirectListener}`);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(`[AuthContext] onAuthStateChanged FIRED. User: ${currentUser ? currentUser.uid : 'null'}. isProcessingRedirectListener (captured by this listener): ${isProcessingRedirectListener}`);
      setUser(currentUser);
      if (!isProcessingRedirectListener) { 
        console.log("[AuthContext] onAuthStateChanged: isProcessingRedirectListener is false, setting setLoading(false).");
        setLoading(false);
      } else {
        console.log("[AuthContext] onAuthStateChanged: isProcessingRedirectListener is true, NOT setting setLoading(false) yet (waiting for redirect to finish).");
      }
    });

    if (isProcessingRedirectState) {
      console.log("[AuthContext] useEffect: isProcessingRedirectState is true. Calling getRedirectResult...");
      getRedirectResult(auth)
        .then((result) => {
          console.log("[AuthContext] getRedirectResult: Successfully called. Result:", result ? { user: result.user?.uid, providerId: result.providerId } : null);
          if (result && result.user) {
            console.log("[AuthContext] getRedirectResult: User found in result:", result.user?.uid, "Display Name:", result.user?.displayName);
          } else {
            console.log("[AuthContext] getRedirectResult: No user in result or result is null.");
          }
        })
        .catch((error) => {
          console.error("[AuthContext] getRedirectResult: Error processing redirect:", error);
          handleAuthError(error as AuthError, "Google Sign-in (Redirect Result Processing)");
        })
        .finally(() => {
          console.log("[AuthContext] getRedirectResult.finally: Setting isProcessingRedirectState(false). This will re-run useEffect.");
          setIsProcessingRedirectState(false); 
        });
    }

    return () => {
      console.log("[AuthContext] useEffect CLEANUP. Unsubscribing onAuthStateChanged.");
      unsubscribe();
    };
  }, [isProcessingRedirectState]); 

  const handleAuthError = (error: AuthError, action: "Sign-in" | "Sign-up" | "Guest Sign-in" | "Password Reset" | "Google Sign-in" | "Google Sign-in (Redirect Result Processing)" | "Username Registration") => {
    console.error(`[AuthContext] Error during ${action.toLowerCase()}:`, error.code, error.message);
    let title = `${action} Failed`;
    let description = error.message || "An unexpected error occurred. Please try again.";

    switch (error.code) {
      case 'auth/user-not-found':
        description = action === "Password Reset" ? "No user found with this email. Cannot send reset link." : "No account found with this email/username. Please sign up or check your credentials.";
        break;
      case 'auth/wrong-password':
        description = "Incorrect password. Please try again.";
        break;
      case 'auth/invalid-email':
        description = "The email address is not valid.";
        break;
      case 'auth/email-already-in-use':
        description = "This email is already registered. Please sign in or use a different email.";
        break;
      case 'auth/weak-password':
        description = "The password is too weak. Please choose a stronger password (at least 6 characters).";
        break;
      case 'auth/operation-not-allowed':
        description = `This sign-in method (${action}) is not enabled. Please contact support or check Firebase console settings.`;
        break;
      case 'auth/missing-email':
        description = "Please enter an email address to reset your password.";
        break;
      case 'auth/invalid-credential':
         description = "Invalid credentials. Please check your email/username and password. If you don't have an account, please sign up.";
         break;
      case 'auth/cancelled-popup-request':
      case 'auth/popup-closed-by-user': 
        title = "Sign-in Cancelled or Interrupted";
        description = `The Google sign-in process was closed, cancelled, or could not be completed.
If this was unexpected, please ensure:
1. Pop-ups are allowed (though less relevant for redirect).
2. Your OAuth configuration (Authorized Domains, Authorized JavaScript Origins, AND Authorized Redirect URIs) in Firebase Console and Google Cloud Console is correctly set up for THIS EXACT environment/URL.
This is a common cause for redirect flows failing to complete. Original SDK error: ${error.message}`;
        break;
      case 'auth/account-exists-with-different-credential':
        description = "An account already exists with this email address, but was created using a different sign-in method (e.g., password). Try signing in with that method.";
        title = "Account Conflict";
        break;
      case 'auth/unauthorized-domain':
        title = "Unauthorized Domain for Google Sign-In";
        description = `CRITICAL: This app's domain is not authorized for Google Sign-In.
1. In Firebase Console > Authentication > Settings > Authorized domains: Add your app's domain (e.g., 'your-app-name.cloudworkstations.dev' - NO 'https://', NO port).
2. In Google Cloud Console > APIs & Services > Credentials > Your OAuth 2.0 Client ID > Authorized JavaScript origins: Add your app's origin (e.g., 'https://your-app-name.cloudworkstations.dev' - WITH 'https://', NO port).
3. Also for redirect, ensure the redirect URI (e.g., https://[YOUR_PROJECT_ID].firebaseapp.com/__/auth/handler AND your app's main origin) is in Google Cloud Console's OAuth Client "Authorized redirect URIs".
This must exactly match the domain you are using. Original SDK error: ${error.message}`;
        break;
      default:
        console.warn(`[AuthContext] Unhandled Firebase Auth Error Code: ${error.code}`);
        if (action.startsWith("Google Sign-in") && error.message && (error.message.toLowerCase().includes("cancelled") || error.message.toLowerCase().includes("closed"))) {
            title = "Google Sign-in Interrupted";
            description = `The Google sign-in process was interrupted or could not be completed. Error: ${error.message}. Please ensure your OAuth configuration (Authorized Domains, Origins, Redirect URIs) in Firebase and Google Cloud Console is correct for this environment.`;
        }
        break;
    }
    if (action === "Username Registration" && !(error as AuthError).code) {
        title = "Username Registration Failed";
        description = error.message || "Could not register the username.";
    }

    toast({ title, description, variant: "destructive", duration: 15000 });
  }

  const commonAuthActionLogic = async (
    authFunction: () => Promise<any>,
    rememberMe: boolean,
    actionName: "Sign-in"
  ) => {
    try {
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);
      await authFunction();
    } catch (error) {
      handleAuthError(error as AuthError, actionName);
    }
  };

  const signInWithEmailPassword = async (emailOrUsername: string, pass: string, rememberMe: boolean = true) => {
    let finalEmail = emailOrUsername;

    if (!isValidEmail(emailOrUsername)) {
      toast({ title: "Looking up username...", description: "Please wait.", duration: 2000});
      const result = await getEmailFromUsername(emailOrUsername.toLowerCase());
      if (result.email) {
        finalEmail = result.email;
      } else {
        toast({ title: "Sign-in Failed", description: result.error || "Username not found or could not be verified.", variant: "destructive" });
        return;
      }
    }

    await commonAuthActionLogic(
      () => firebaseSignInWithEmailAndPassword(auth, finalEmail, pass),
      rememberMe,
      "Sign-in"
    );
  };

  const signUpWithEmailPassword = async (email: string, pass: string, username: string, rememberMe: boolean = true) => {
    setIsSettingUpNewProfile(false);

    const lowerUsername = username.toLowerCase();
    const usernameCheck = await getEmailFromUsername(lowerUsername);
    if (usernameCheck.email) {
      toast({
        title: "Username Taken",
        description: "Username is already taken. Please use another username.",
        variant: "destructive",
        duration: 10000 
      });
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    if (!usernameRegex.test(username)) {
      toast({
        title: "Invalid Username",
        description: "Username must be at least 3 characters and can only contain letters, numbers, and underscores (_). No spaces or other special characters.",
        variant: "destructive",
        duration: 10000
      });
      return;
    }

    try {
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);

      const userCredential = await firebaseCreateUserWithEmailAndPassword(auth, email, pass);

      let currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== userCredential.user.uid) {
        console.log("[AuthContext] signUp: Waiting for currentUser to update after creation...");
        await new Promise(resolve => setTimeout(resolve, 500));
        currentUser = auth.currentUser;
      }

      if (currentUser) {
        setIsSettingUpNewProfile(true);
        console.log("[AuthContext] signUp: Updating profile for:", currentUser.uid, "with displayName:", username);
        await updateProfile(currentUser, { displayName: username });

        console.log("[AuthContext] signUp: Reloading user data for:", currentUser.uid);
        await currentUser.reload();
        currentUser = auth.currentUser; // Re-assign after reload

        if (!currentUser) {
            console.error("[AuthContext] signUp: Critical - User object became null after reload.");
            throw new Error("User object became null after reload. This is unexpected.");
        }
        console.log("[AuthContext] signUp: User reloaded. Current displayName:", currentUser.displayName);

        console.log("[AuthContext] signUp: Getting ID token for username registration, UID:", currentUser.uid);
        const idTokenResult = await currentUser.getIdTokenResult(true);
        const idToken = idTokenResult.token;
        console.log("[AuthContext] signUp: ID Token obtained. Proceeding with username registration.");

        const usernameResult = await createUsernameEntry(idToken, currentUser.uid, lowerUsername, email);

        if (usernameResult.success) {
          console.log("[AuthContext] signUp: Username registration successful.");
          // Final token refresh to ensure client SDK is fully synchronized
          try {
            console.log("[AuthContext] signUp: Performing final token refresh before completing profile setup sequence.");
            await currentUser.getIdToken(true); 
            console.log("[AuthContext] signUp: Final token refresh completed.");
          } catch (finalTokenError) {
            console.warn("[AuthContext] signUp: Non-critical error during final token refresh:", finalTokenError);
          }
        } else {
          handleAuthError({ name: "UsernameError", message: usernameResult.message } as unknown as AuthError, "Username Registration");
          // Consider if you need to delete the Firebase user if username registration fails critically
        }
      } else {
        console.error("[AuthContext] signUp: Critical - User object not available after creation.");
        throw new Error("User object not available after creation. Cannot update profile or register username.");
      }
    } catch (error) {
      handleAuthError(error as AuthError, "Sign-up");
    } finally {
      setIsSettingUpNewProfile(false);
    }
  };

  const signInWithGoogle = async () => {
    console.log("[AuthContext] Attempting Google Sign-In with redirect.");
    try {
      const provider = new GoogleAuthProvider();
      await setPersistence(auth, browserLocalPersistence); 
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("[AuthContext] Error initiating Google Sign-In redirect:", error);
      handleAuthError(error as AuthError, "Google Sign-in");
      setIsProcessingRedirectState(false); 
    }
  };

  const signInAsGuest = async () => {
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInAnonymously(auth);
    } catch (error) {
      handleAuthError(error as AuthError, "Guest Sign-in");
    }
  };

  const sendPasswordReset = async (emailToReset: string) => {
    if (!isValidEmail(emailToReset)) {
        toast({ title: "Invalid Email", description: "Please enter a valid email address to reset your password.", variant: "destructive"});
        return;
    }
    try {
      await sendPasswordResetEmail(auth, emailToReset);
      toast({
        title: "Password Reset Email Sent",
        description: `If an account exists for ${emailToReset}, a password reset link has been sent. Please check your inbox (and spam folder).`,
        variant: "default",
        duration: 9000,
      });
    } catch (error) {
      handleAuthError(error as AuthError, "Password Reset");
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/login'); 
      toast({ title: "Signed Out", description: "You have been successfully signed out."});
    } catch (error) {
      console.error("[AuthContext] logout: Error signing out:", error);
      toast({
        title: "Logout Failed",
        description: "Could not log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isSettingUpNewProfile, signInWithEmailPassword, signUpWithEmailPassword, signInWithGoogle, signInAsGuest, sendPasswordReset, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

    
