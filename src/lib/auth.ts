import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        // Magic Link (Email)
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
        signIn: "/profile",
        signOut: "/",
        error: "/profile",
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
    },
    debug: process.env.NODE_ENV === "development",
});
