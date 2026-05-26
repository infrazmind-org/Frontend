import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';

function webConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
  };
}

/** Main Web app (`1:…:web:7401179…`). Initialized when `VITE_FIREBASE_APP_ID` (and API key) are set — see `docs/FIREBASE_WEB_APPS.md`. */
export const firebaseApp: FirebaseApp | null = (() => {
  const cfg = webConfig();
  if (!cfg.apiKey || !cfg.appId) {
    if (import.meta.env.DEV) {
      console.info('[firebase] Main app: set VITE_FIREBASE_* in .env.local (see docs/FIREBASE_WEB_APPS.md).');
    }
    return null;
  }
  return getApps().length ? getApps()[0]! : initializeApp(cfg);
})();

const app = firebaseApp;
if (typeof window !== 'undefined' && app && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
  void import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
    void isSupported().then((ok) => {
      if (ok) getAnalytics(app);
    });
  });
}
