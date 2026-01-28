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
        const syncAuth = async () => {
            // 1. If NextAuth Session exists, sync with Firebase
            if (status === "authenticated" && session?.user) {
                const userId = (session.user as any).id || "unknown";

                // Only update local state if it's different from current state
                // Use a functional update or refer to current state if possible, 
                // but checking userId vs the current user state is the most reliable
                if (!user || user.uid !== userId) {
                    console.log("AuthProvider: User session updated", session.user.email);

                    const mappedUser = {
                        uid: userId,
                        email: session.user.email,
                        displayName: session.user.name,
                        photoURL: session.user.image,
                        emailVerified: true,
                    } as unknown as User;

                    setUser(mappedUser);
                    setUserData({
                        uid: userId,
                        email: session.user.email || "",
                        displayName: session.user.name || "User",
                        role: (session.user as any).role || "user",
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    });
                    setLoading(false);
                }

                // --- Firebase Custom Token Sync ---
                const SKIP_FIREBASE_SYNC = process.env.NEXT_PUBLIC_SKIP_FIREBASE_SYNC === 'true';
                if (SKIP_FIREBASE_SYNC) return;

                try {
                    const currentUser = auth.currentUser;
                    if (currentUser && currentUser.uid === userId) {
                        // Already signed in to Firebase, nothing to do
                        return;
                    }

                    console.log("AuthProvider: Syncing with Firebase...");
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3000);

                    const res = await fetch("/api/auth/firebase", { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (!res.ok) return;

                    const { token } = await res.json();
                    if (token) {
                        const { signInWithCustomToken } = await import("firebase/auth");
                        await signInWithCustomToken(auth, token);
                        console.log("AuthProvider: ✅ Firebase Auth synced");
                    }
                } catch (error: any) {
                    // Silently fail or log once to avoid clutter
                }
                return;
            }

            // 2. Logged out state
            if (status === "unauthenticated") {
                if (user !== null) {
                    console.log("AuthProvider: Clearing session");
                    if (auth.currentUser) {
                        await firebaseSignOut(auth);
                    }
                    setUser(null);
                    setUserData(null);
                }
                setLoading(false);
            }
        };

        syncAuth();
    }, [session, status, user]);

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
