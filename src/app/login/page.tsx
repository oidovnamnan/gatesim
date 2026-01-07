"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, Chrome, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/providers/toast-provider";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"select" | "email">("select");
    const { success, error } = useToast();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn("google", { callbackUrl });
        } catch (err) {
            error("Google-ээр нэвтрэхэд алдаа гарлаа.");
            setIsLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Current backend requires Password. Magic link not enabled.
        // For now, guide users to use Google.
        error("Одоогоор зөвхөн Google эрхээр нэвтрэх боломжтой.");

        // setIsLoading(true);
        // await new Promise(resolve => setTimeout(resolve, 1500));
        // success(`Магик линк ${email} хаягт илгээгдлээ!`);
        // setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-600/10 to-transparent" />
            <div className="absolute top-1/4 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-violet-500/20 rounded-full blur-[100px]" />

            <div className="relative flex-1 flex flex-col justify-center px-6 py-12">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
                        <Smartphone className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">GateSIM</h1>
                    <p className="text-muted-foreground mt-2">Дэлхийд холбогдоорой</p>
                </motion.div>

                {/* Login options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {mode === "select" ? (
                        <Card className="p-6 space-y-4">
                            <h2 className="text-lg font-semibold text-foreground text-center mb-4">
                                Нэвтрэх
                            </h2>

                            {/* Google login */}
                            <Button
                                fullWidth
                                size="lg"
                                variant="secondary"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="bg-white hover:bg-white/90 text-gray-900"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Chrome className="h-5 w-5" />
                                        Google-ээр нэвтрэх
                                    </>
                                )}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-[hsl(var(--card))] text-muted-foreground">эсвэл</span>
                                </div>
                            </div>

                            {/* Email login */}
                            <Button
                                fullWidth
                                size="lg"
                                variant="outline"
                                onClick={() => setMode("email")}
                            >
                                <Mail className="h-5 w-5" />
                                И-мэйлээр нэвтрэх
                            </Button>
                        </Card>
                    ) : (
                        <Card className="p-6">
                            <button
                                onClick={() => setMode("select")}
                                className="text-sm text-muted-foreground mb-4 hover:text-foreground"
                            >
                                ← Буцах
                            </button>

                            <h2 className="text-lg font-semibold text-foreground mb-4">
                                И-мэйлээр нэвтрэх
                            </h2>

                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <Input
                                    type="email"
                                    icon={Mail}
                                    placeholder="И-мэйл хаяг"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <p className="text-xs text-muted-foreground">
                                    Бид таны и-мэйл рүү нэвтрэх линк илгээнэ
                                </p>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="lg"
                                    disabled={isLoading || !email}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Үргэлжлүүлэх
                                            <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Card>
                    )}
                </motion.div>

                {/* Terms */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-xs text-muted-foreground mt-6"
                >
                    Нэвтрэснээр та манай{" "}
                    <Link href="/terms" className="underline hover:text-foreground">
                        Үйлчилгээний нөхцөл
                    </Link>{" "}
                    болон{" "}
                    <Link href="/privacy" className="underline hover:text-foreground">
                        Нууцлалын бодлого
                    </Link>
                    -ыг зөвшөөрч байна.
                </motion.p>

                {/* Skip for now */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-8"
                >
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        Зочноор үргэлжлүүлэх →
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
