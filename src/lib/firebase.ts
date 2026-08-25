import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

const app = isFirebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : null;

const db = app ? getFirestore(app) : null;

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

/**
 * Writes a contact form submission to the "messages" collection.
 * Requires NEXT_PUBLIC_FIREBASE_* env vars and Firestore rules that
 * allow client-side create on "messages" (see README for setup).
 */
export async function submitContactMessage(payload: ContactMessage): Promise<void> {
  if (!db) {
    throw new Error(
      "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars to enable the contact form."
    );
  }
  await addDoc(collection(db, "messages"), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}
