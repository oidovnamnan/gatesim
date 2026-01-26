import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    providers: [
        ...authConfig.providers.filter(p => p.id !== "credentials"),
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

                if (!user || !(user as any).password) {
                    throw new Error("Имэйл эсвэл нууц үг буруу байна.");
                }

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
});
