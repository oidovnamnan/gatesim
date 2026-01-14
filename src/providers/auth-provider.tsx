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

        const handleAuthChange = async () => {
            // 1. Check NextAuth Session first
            if (status === "authenticated" && session?.user) {
                console.log("AuthProvider: Using NextAuth Session");
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
                    role: "user",
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });
                setLoading(false);
                return;
            }

            // 2. If no NextAuth session (and check is done), listen to Firebase
            if (status === "unauthenticated") {
                console.log("AuthProvider: Listening to Firebase Auth (Fallback)");
                unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
                    console.log("AuthProvider: Firebase User Changed", firebaseUser?.email);
                    setUser(firebaseUser);

                    if (firebaseUser) {
                        const userRef = doc(db, "users", firebaseUser.uid);
                        try {
                            const userSnap = await getDoc(userRef);

                            if (userSnap.exists()) {
                                setUserData(userSnap.data() as UserData);
                            } else {
                                const newUserData: UserData = {
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email || "",
                                    displayName: firebaseUser.displayName || "User",
                                    photoURL: firebaseUser.photoURL || undefined,
                                    role: "user",
                                    createdAt: Date.now(),
                                    updatedAt: Date.now()
                                };
                                await setDoc(userRef, newUserData);
                                setUserData(newUserData);
                            }
                        } catch (err) {
                            console.error("Error fetching user data:", err);
                        }
                    } else {
                        setUserData(null);
                    }
                    setLoading(false);
                });
            }
        };

        handleAuthChange();

        return () => {
            if (unsubscribeFirebase) unsubscribeFirebase();
        };
    }, [session, status]);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
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
