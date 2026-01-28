import "server-only";
import admin from "firebase-admin";

interface FirebaseAdminConfig {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, "\n");
}

export function createFirebaseAdminApp(config: FirebaseAdminConfig) {
    try {
        if (admin.apps.length > 0) {
            return admin.app();
        }

        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId: config.projectId,
                clientEmail: config.clientEmail,
                privateKey: formatPrivateKey(config.privateKey),
            }),
        });
    } catch (error) {
        console.error("Firebase admin initialization error", error);
        throw error;
    }
}

// Initialize
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

let adminApp: admin.app.App | null = null;
let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;

try {
    if (admin.apps.length > 0) {
        adminApp = admin.app();
    } else if (privateKey && clientEmail && projectId) {
        // Option 1: Explicit Service Account (Production / Manual)
        adminApp = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: formatPrivateKey(privateKey),
            }),
        });
        console.log("🔥 Firebase Admin Initialized with Service Account");
    } else if (projectId) {
        // Option 2: Application Default Credentials (Local Dev)
        // Requires running: gcloud auth application-default login
        adminApp = admin.initializeApp({
            projectId,
            credential: admin.credential.applicationDefault()
        });
        console.log("🔥 Firebase Admin Initialized with Application Default Credentials");
    }

    if (adminApp) {
        adminAuth = adminApp.auth();
        adminDb = adminApp.firestore();
    }
} catch (e) {
    console.error("❌ Failed to initialize Firebase Admin:", e);
}

export { adminAuth, adminDb };
