"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Phone, Loader2, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { useTranslation } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = "login" | "register";

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { t } = useTranslation();
    const { signInWithGoogle, signInWithEmail, registerWithEmail } = useAuth();
    const [mode, setMode] = useState<AuthMode>("login");
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [mounted, setMounted] = useState(false);

    // Portal requires client-side mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (mode === "register" && phone && !/^\d{8}$/.test(phone)) {
            alert(t("error") + ": 8 оронтой тоо оруулна уу.");
            setLoading(false);
            return;
        }

        try {
            if (mode === "register") {
                await registerWithEmail(email, password, phone);
            } else {
                await signInWithEmail(email, password);
            }
            onClose();
            // Reset form
            setEmail("");
            setPassword("");
            setPhone("");
        } catch (error: any) {
            console.error(error);
            alert(error.message || t("error"));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            alert(t("error") + ": И-мэйл хаяг оруулна уу");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                setResetEmailSent(true);
            } else {
                const data = await res.json();
                alert(data.error || t("error"));
            }
        } catch {
            alert(t("error"));
        } finally {
            setLoading(false);
        }
    };

    // Don't render on server
    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[101] flex items-start justify-center overflow-y-auto py-8 px-4">
                        {/* Modal Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl border border-white/50 ring-1 ring-black/5 overflow-hidden"
                        >
                            {/* Box Content Padded */}
                            <div className="p-6 relative" style={{ display: 'block' }}>
                                {/* Decorative Glow - RED THEMED */}
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500" />
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all p-2 rounded-full z-20"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="text-center mb-6 relative z-10">
                                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
                                        {showForgotPassword
                                            ? (t("forgotPassword") || "Нууц үг сэргээх")
                                            : (mode === "login" ? t("welcomeBack") : t("signUp"))
                                        }
                                    </h2>
                                    <p className="text-slate-500 text-sm font-medium">
                                        {showForgotPassword
                                            ? (t("forgotPasswordDesc") || "Бүртгэлтэй и-мэйл хаягаа оруулна уу")
                                            : t("authSubtitle")
                                        }
                                    </p>
                                </div>

                                {/* Forgot Password Form */}
                                {showForgotPassword ? (
                                    resetEmailSent ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                                                <Mail className="w-8 h-8 text-green-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                                {t("resetEmailSent") || "И-мэйл илгээгдлээ!"}
                                            </h3>
                                            <p className="text-slate-500 text-sm mb-6">
                                                {t("resetEmailSentDesc") || "Нууц үг сэргээх линкийг и-мэйлээсээ шалгана уу."}
                                            </p>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setShowForgotPassword(false);
                                                    setResetEmailSent(false);
                                                }}
                                                className="rounded-xl"
                                            >
                                                {t("backToLogin") || "Нэвтрэх руу буцах"}
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleForgotPassword} className="space-y-4">
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    placeholder={t("email")}
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all font-medium"
                                                />
                                            </div>
                                            <Button
                                                fullWidth
                                                size="lg"
                                                type="submit"
                                                disabled={loading}
                                                className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (t("sendResetLink") || "Линк илгээх")}
                                            </Button>
                                            <button
                                                type="button"
                                                onClick={() => setShowForgotPassword(false)}
                                                className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium"
                                            >
                                                ← {t("backToLogin") || "Нэвтрэх руу буцах"}
                                            </button>
                                        </form>
                                    )
                                ) : (
                                    <>

                                        {/* Google Button */}
                                        <Button
                                            variant="outline"
                                            className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all mb-4 h-12 rounded-xl font-bold shadow-sm"
                                            onClick={handleGoogleLogin}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin mr-2 text-red-600" />
                                            ) : (
                                                <Chrome className="w-5 h-5 mr-2 text-red-600" />
                                            )}
                                            {t("continueWithGoogle")}
                                        </Button>

                                        <div className="relative mb-4">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-slate-100"></div>
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                                                <span className="bg-white px-3 text-slate-400">{t("or")}</span>
                                            </div>
                                        </div>

                                        {/* Email Form */}
                                        <form onSubmit={handleEmailAuth} className="space-y-4 relative z-10">
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        placeholder={t("email")}
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all font-medium"
                                                    />
                                                </div>

                                                {mode === "register" && (
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                        <input
                                                            placeholder={t("phoneOptional")}
                                                            type="tel"
                                                            value={phone}
                                                            onChange={(e) => setPhone(e.target.value)}
                                                            className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all font-medium"
                                                        />
                                                    </div>
                                                )}

                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        placeholder={t("password")}
                                                        type="password"
                                                        required
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all font-medium"
                                                    />
                                                </div>

                                                {mode === "login" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowForgotPassword(true)}
                                                        className="text-sm text-slate-500 hover:text-red-600 font-medium transition-colors text-right w-full"
                                                    >
                                                        {t("forgotPassword") || "Нууц үг мартсан уу?"}
                                                    </button>
                                                )}
                                            </div>

                                            <Button
                                                fullWidth
                                                size="lg"
                                                type="submit"
                                                disabled={loading}
                                                className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === "login" ? t("login") : t("signUp"))}
                                            </Button>
                                        </form>

                                        {/* Toggle Mode */}
                                        <div className="mt-8 text-center relative z-10">
                                            <p className="text-sm text-slate-500 font-medium">
                                                {mode === "login" ? t("noAccount") : t("alreadyRegistered")}{" "}
                                                <button
                                                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                                                    className="text-red-600 hover:text-red-700 font-bold transition-colors ml-1"
                                                >
                                                    {mode === "login" ? t("signUp") : t("login")}
                                                </button>
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
