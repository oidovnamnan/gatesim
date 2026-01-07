import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Имэйл болон нууц үгээ оруулна уу.");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email as string
                    }
                });

                // If user doesn't exist or has no password (e.g. Google auth only)
                if (!user || !(user as any).password) {
                    throw new Error("Имэйл эсвэл нууц үг буруу байна.");
                }

                // Compare passwords
                const isCorrectPassword = await bcrypt.compare(
                    credentials.password as string,
                    (user as any).password
                );

                if (!isCorrectPassword) {
                    throw new Error("Имэйл эсвэл нууц үг буруу байна.");
                }

                return user;
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
        async signIn({ user, account, profile }) {
            console.log("SignIn callback triggered:", {
                user: user?.email,
                account: account?.provider,
                profile: profile?.email
            });
            // Allow all sign-ins
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                (session.user as any).id = token.id as string;
            }
            return session;
        },
    },
    debug: process.env.NODE_ENV === "development",
});
