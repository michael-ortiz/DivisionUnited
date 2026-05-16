import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function initFirebase() {
  if (getApps().length > 0) return;

  // Use explicit service account key if provided, otherwise fall back to ADC
  if (process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.includes("\\n")
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
            : process.env.FIREBASE_PRIVATE_KEY,
      }),
    });
  } else {
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
}

initFirebase();
export const db = getFirestore();
