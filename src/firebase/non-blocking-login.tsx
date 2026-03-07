'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> | void {
  if (!authInstance) return;
  return signInAnonymously(authInstance).catch(error => {
    console.error("Auth Error:", error);
    throw error;
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> | void {
  if (!authInstance) return;
  return createUserWithEmailAndPassword(authInstance, email, password).catch(error => {
    console.error("Sign Up Error:", error);
    throw error;
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> | void {
  if (!authInstance) return;
  return signInWithEmailAndPassword(authInstance, email, password).catch(error => {
    console.error("Sign In Error:", error);
    throw error;
  });
}