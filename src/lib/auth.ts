import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
        // Email/Password (for development/testing)
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // For development only - create/find user by email
                if (process.env.NODE_ENV === "development") {
                    const email = credentials?.email as string;
                    if (!email) return null;

                    try {
                        let user = await prisma.user.findUnique({
                            where: { email },
                        });

                        if (!user) {
                            user = await prisma.user.create({
                                data: {
                                    email,
                                    name: email.split("@")[0],
                                },
                            });
                        }

                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            image: user.image,
                        };
                    } catch (error) {
                        console.error("Auth error:", error);
                        return null;
                    }
                }

                return null;
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/login",
        signOut: "/",
        error: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    debug: process.env.NODE_ENV === "development",
});
