'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  if (!authInstance) return;
  signInAnonymously(authInstance).catch(error => {
    console.error("Auth Error:", error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  if (!authInstance) return;
  createUserWithEmailAndPassword(authInstance, email, password).catch(error => {
    console.error("Sign Up Error:", error);
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  if (!authInstance) return;
  signInWithEmailAndPassword(authInstance, email, password).catch(error => {
    console.error("Sign In Error:", error);
  });
}