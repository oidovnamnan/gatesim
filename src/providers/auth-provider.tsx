"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { UserData } from "@/types/db";

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    registerWithEmail: (email: string, password: string, phone?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeFirebase: (() => void) | undefined;

        const syncAuth = async () => {
            // 1. If NextAuth Session exists, sync with Firebase
            if (status === "authenticated" && session?.user) {
                console.log("AuthProvider: NextAuth Session Active", session.user.email);

                // Set local state immediately for UI responsiveness
                const mappedUser = {
                    uid: (session.user as any).id || "unknown",
                    email: session.user.email,
                    displayName: session.user.name,
                    photoURL: session.user.image,
                    emailVerified: true,
                } as unknown as User;

                setUser(mappedUser);
                setUserData({
                    uid: (session.user as any).id || "unknown",
                    email: session.user.email || "",
                    displayName: session.user.name || "User",
                    role: (session.user as any).role || "user", // Ensure role is captured
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });
                setLoading(false);

                // --- Firebase Custom Token Sync (Optional) ---
                // Skip if Admin SDK is not configured (missing FIREBASE_PRIVATE_KEY)
                // This prevents slow loading and 500 errors on production
                const SKIP_FIREBASE_SYNC = process.env.NEXT_PUBLIC_SKIP_FIREBASE_SYNC === 'true';

                if (SKIP_FIREBASE_SYNC) {
                    console.log("AuthProvider: Firebase sync disabled via NEXT_PUBLIC_SKIP_FIREBASE_SYNC");
                    return;
                }

                try {
                    // Check if already signed in to Firebase as the same user
                    const currentUser = auth.currentUser;
                    if (currentUser && currentUser.uid === ((session.user as any).id)) {
                        console.log("AuthProvider: Already signed in to Firebase");
                        return;
                    }

                    console.log("AuthProvider: Fetching Custom Token...");

                    // Add timeout to prevent slow loading
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

                    const res = await fetch("/api/auth/firebase", { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (!res.ok) {
                        console.warn("AuthProvider: Custom Token API unavailable, continuing without Firebase Auth");
                        return;
                    }

                    const { token } = await res.json();
                    if (token) {
                        const { signInWithCustomToken } = await import("firebase/auth");
                        await signInWithCustomToken(auth, token);
                        console.log("AuthProvider: ✅ Signed in with Custom Token");
                    }
                } catch (error: any) {
                    if (error.name === 'AbortError') {
                        console.warn("AuthProvider: Custom Token fetch timed out, continuing without Firebase Auth");
                    } else {
                        console.warn("AuthProvider: Custom Token unavailable, continuing with NextAuth only");
                    }
                }
                return;
            }

            // 2. If no NextAuth session, we could be in a logged-out state OR purely client-side state (unlikely with this setup)
            if (status === "unauthenticated") {
                console.log("AuthProvider: No NextAuth Session. Checking Firebase...");
                // Ensure Firebase is also signed out if NextAuth is
                if (auth.currentUser) {
                    await firebaseSignOut(auth);
                }
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
        };

        syncAuth();

        // Still listen to Firebase changes to keep `user` state strictly in sync if token expires/refreshes
        // But mainly rely on session for initial load
        return () => { };
    }, [session, status]);

    const signInWithGoogle = async () => {
        try {
            await nextAuthSignIn("google", { callbackUrl: "/profile" });
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        const result = await nextAuthSignIn("credentials", {
            email,
            password,
            redirect: false
        });

        if (result?.error) {
            throw new Error("Имэйл эсвэл нууц үг буруу байна.");
        }
        // Force reload or state update handled by useSession effect
    };

    const registerWithEmail = async (email: string, password: string, phone?: string) => {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, phone })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Бүртгэл амжилтгүй боллоо.");
        }

        // Auto login
        await signInWithEmail(email, password);
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            await nextAuthSignOut({ redirect: false });
            setUser(null);
            setUserData(null);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            loading,
            signInWithGoogle,
            signOut,
            signInWithEmail,
            registerWithEmail
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
