/**
 * Thin wrapper around the Firebase SDK: one-time init + anonymous auth.
 * This is the account/save foundation everything else (real async PvP,
 * real leaderboards, cross-player notifications) depends on — nothing
 * downstream works without a signed-in uid.
 *
 * Posture (matches runSdk.ts): never throw on init. If config is missing
 * (e.g. local dev without a .env file yet), log a warning and let the app
 * boot anyway — callers check firebaseReady() the same way they check
 * sdkReady(), and degrade to local-only behavior.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged,
    type Auth,
    type User,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Populated from Vite env vars (VITE_ prefix required to reach client code).
// See .env.example — copy to .env.local and fill in from the Firebase
// Console (Project Settings > General > Your apps > Web app > SDK setup).
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _ready = false;
let _uid: string | null = null;

/** True once anonymous sign-in resolved and we have a stable uid. */
export function firebaseReady(): boolean {
    return _ready;
}

/** The current player's uid, or null if Firebase never came up. */
export function currentUid(): string | null {
    return _uid;
}

/** Firestore instance — only call after initFirebase() has resolved. */
export function db(): Firestore | null {
    return _db;
}

/**
 * Initialize Firebase and sign in anonymously. Call once, at boot, after
 * initSdk(). Never throws — missing config or a network hiccup just means
 * the game runs without cloud saves/multiplayer, same as it does today
 * outside the RUN host.
 */
export async function initFirebase(): Promise<boolean> {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.warn('[firebaseSdk] no Firebase config found — copy .env.example to .env.local and fill it in. Running without cloud saves.');
        return false;
    }

    try {
        _app = initializeApp(firebaseConfig);
        _auth = getAuth(_app);
        _db = getFirestore(_app);

        const user = await new Promise<User | null>((resolve) => {
            // onAuthStateChanged fires once immediately with the cached
            // session (if any) before we've called signInAnonymously —
            // only resolve once we get a real user back.
            const unsub = onAuthStateChanged(_auth!, (u) => {
                if (u) {
                    unsub();
                    resolve(u);
                }
            });
            signInAnonymously(_auth!).catch((err) => {
                console.warn('[firebaseSdk] signInAnonymously failed', err);
                unsub();
                resolve(null);
            });
        });

        if (!user) return false;
        _uid = user.uid;
        _ready = true;
    } catch (err) {
        console.warn('[firebaseSdk] init failed — running without cloud saves', err);
    }
    return _ready;
}
