"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Phone, Loader2, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = "login" | "register";

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { signInWithGoogle } = useAuth();
    const [mode, setMode] = useState<AuthMode>("login");
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

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
        setTimeout(() => {
            setLoading(false);
            alert("Имэйлээр нэвтрэх хэсэг хөгжүүлэлтийн шатанд байна. Google ашиглана уу.");
        }, 1000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden border border-white/50 ring-1 ring-black/5"
                    >
                        {/* Box Content Padded */}
                        <div className="p-8 relative">
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

                            <div className="text-center mb-8 relative z-10">
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
                                    {mode === "login" ? "Эргэн тавтай морил" : "Шинээр бүртгүүлэх"}
                                </h2>
                                <p className="text-slate-500 text-sm font-medium">
                                    GateSIM-д нэгдэн дэлхийн хаана ч холбогдоорой
                                </p>
                            </div>

                            {/* Google Button */}
                            <Button
                                variant="outline"
                                className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all mb-6 h-12 rounded-xl font-bold shadow-sm"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-red-600" />
                                ) : (
                                    <Chrome className="w-5 h-5 mr-2 text-red-600" />
                                )}
                                Google-ээр үргэлжлүүлэх
                            </Button>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                                    <span className="bg-white px-3 text-slate-400">эсвэл</span>
                                </div>
                            </div>

                            {/* Email Form */}
                            <form onSubmit={handleEmailAuth} className="space-y-4 relative z-10">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            placeholder="Имэйл хаяг"
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
                                                placeholder="Утасны дугаар (Заавал биш)"
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
                                            placeholder="Нууц үг"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <Button
                                    fullWidth
                                    size="lg"
                                    type="submit"
                                    disabled={loading}
                                    className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх")}
                                </Button>
                            </form>

                            {/* Toggle Mode */}
                            <div className="mt-8 text-center relative z-10">
                                <p className="text-sm text-slate-500 font-medium">
                                    {mode === "login" ? "Хаяг байхгүй юу?" : "Бүртгэлтэй юу?"}{" "}
                                    <button
                                        onClick={() => setMode(mode === "login" ? "register" : "login")}
                                        className="text-red-600 hover:text-red-700 font-bold transition-colors ml-1"
                                    >
                                        {mode === "login" ? "Бүртгүүлэх" : "Нэвтрэх"}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
