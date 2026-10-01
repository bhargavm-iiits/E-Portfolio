import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { CONTACT_LIMITS } from "@/config/site";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

const LIMITS = CONTACT_LIMITS;

let appPromise: Promise<FirebaseApp> | null = null;

/** Lazily initialises Firebase (+ App Check when a reCAPTCHA v3 key is set). */
function getApp(): Promise<FirebaseApp> {
  appPromise ??= (async () => {
    const app = getApps()[0] ?? initializeApp(firebaseConfig);
    if (recaptchaKey && typeof window !== "undefined") {
      const { initializeAppCheck, ReCaptchaV3Provider } = await import("firebase/app-check");
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });
    }
    return app;
  })();
  return appPromise;
}

/**
 * Writes a transmission to the Firestore "messages" collection. Firestore rules
 * should allow `create` only, with field/type/length checks matching LIMITS.
 */
export async function submitContactMessage(payload: ContactMessage): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("NOT_CONFIGURED");
  const app = await getApp();
  const { getFirestore, collection, addDoc, serverTimestamp } = await import("firebase/firestore");
  await addDoc(collection(getFirestore(app), "messages"), {
    name: payload.name.slice(0, LIMITS.name),
    email: payload.email.slice(0, LIMITS.email),
    message: payload.message.slice(0, LIMITS.message),
    createdAt: serverTimestamp(),
  });
}
