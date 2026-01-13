"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2, Chrome, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/providers/toast-provider";
import { signIn } from "next-auth/react";
import { useTranslation } from "@/providers/language-provider";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"select" | "email">("select");
    const { success, error } = useToast();
    const { t } = useTranslation();

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn("google", { callbackUrl: "/profile" });
        } catch (err) {
            error(t("error") || "Google-ээр нэвтрэхэд алдаа гарлаа.");
            setIsLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            await signIn("email", { email, callbackUrl: "/profile", redirect: false });
            success(t("magicLinkSent") || "Таны и-мэйл рүү нэвтрэх линк илгээлээ. И-мэйлээ шалгана уу.");
            setMode("select");
        } catch (err) {
            error(t("error") || "Алдаа гарлаа. Дахин оролдоно уу.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Logo Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-red-500/20">
                    <Smartphone className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gate<span className="text-red-600">SIM</span></h1>
                <p className="text-slate-500 font-medium mt-1">{t("eSimPlatform")}</p>
            </motion.div>

            {/* Login Options */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {mode === "select" ? (
                    <Card className="p-8 space-y-4 border-slate-200 shadow-xl shadow-slate-200/50">
                        <h2 className="text-xl font-bold text-slate-900 text-center mb-6">
                            {t("login")}
                        </h2>

                        {/* Google login */}
                        <Button
                            fullWidth
                            size="lg"
                            variant="secondary"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 h-14 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                            ) : (
                                <>
                                    <Chrome className="h-6 w-6 text-red-600" />
                                    {t("continueWithGoogle")}
                                </>
                            )}
                        </Button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                                <span className="px-4 bg-white text-slate-400">{t("or")}</span>
                            </div>
                        </div>

                        {/* Email login */}
                        <Button
                            fullWidth
                            size="lg"
                            variant="outline"
                            onClick={() => setMode("email")}
                            className="h-14 rounded-2xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                        >
                            <Mail className="h-5 w-5 mr-2 text-slate-400" />
                            {t("continueWithEmail") || "И-мэйлээр нэвтрэх"}
                        </Button>
                    </Card>
                ) : (
                    <Card className="p-8 border-slate-200 shadow-xl shadow-slate-200/50">
                        <button
                            onClick={() => setMode("select")}
                            className="text-sm font-bold text-slate-400 mb-6 hover:text-slate-900 transition-colors flex items-center gap-1"
                        >
                            ← {t("back")}
                        </button>

                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            {t("continueWithEmail") || "И-мэйлээр нэвтрэх"}
                        </h2>
                        <p className="text-slate-500 text-sm mb-6 font-medium">
                            {t("magicLinkSubtitle") || "Бид таны и-мэйл рүү нэвтрэх линк илгээнэ."}
                        </p>

                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <Input
                                type="email"
                                icon={Mail}
                                placeholder={t("emailPlaceholder") || "И-мэйл хаяг"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all px-4"
                            />

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                disabled={isLoading || !email}
                                className="h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        {t("continue")}
                                        <ArrowRight className="h-5 w-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>
                )}
            </motion.div>
        </div>
    );
}
