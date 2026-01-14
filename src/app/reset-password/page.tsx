"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Токен олдсонгүй.");
            return;
        }

        if (password.length < 6) {
            setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Нууц үг таарахгүй байна.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Алдаа гарлаа");
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Алдаа гарлаа. Дахин оролдоно уу.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <Card className="p-8 max-w-md w-full text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Токен олдсонгүй</h1>
                    <p className="text-slate-500 mb-6">
                        Нууц үг сэргээх линк буруу байна. Дахин хүсэлт илгээнэ үү.
                    </p>
                    <Link href="/profile">
                        <Button className="bg-red-600 hover:bg-red-700">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Нэвтрэх хуудас руу
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="p-8 max-w-md w-full text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-slate-900 mb-2">Амжилттай!</h1>
                        <p className="text-slate-500 mb-6">
                            Таны нууц үг амжилттай солигдлоо. Одоо шинэ нууц үгээр нэвтэрч болно.
                        </p>
                        <Link href="/profile">
                            <Button className="bg-red-600 hover:bg-red-700">
                                Нэвтрэх
                            </Button>
                        </Link>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Шинэ Нууц Үг</h1>
                        <p className="text-slate-500 mt-2">Шинэ нууц үгээ оруулна уу</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                placeholder="Шинэ нууц үг"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all font-medium"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                placeholder="Нууц үг давтах"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all font-medium"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Нууц үг солих"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/profile" className="text-sm text-slate-500 hover:text-slate-700">
                            ← Нэвтрэх хуудас руу буцах
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
