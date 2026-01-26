import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import Credentials from "next-auth/providers/credentials";

// The auth configuration that is shared between Node.js and Edge runtimes
export const authConfig = {
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Email({
            server: {
                ...(process.env.SMTP_HOST ? {
                    host: process.env.SMTP_HOST,
                    port: Number(process.env.SMTP_PORT || 587),
                    secure: process.env.SMTP_SECURE === "true",
                } : {
                    service: "gmail",
                }),
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD,
                },
            },
            from: process.env.SMTP_EMAIL,
        }),
        // We leave Credentials empty here if it needs DB access, 
        // or we move the authorize logic to the main auth.ts
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    pages: {
        signIn: "/profile",
        signOut: "/",
        error: "/profile",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                (session.user as any).id = token.id as string;
                (session.user as any).role = token.role;
            }
            return session;
        },
    }
} satisfies NextAuthConfig;
