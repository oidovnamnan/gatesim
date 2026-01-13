"use client";

import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, User, Phone, Mail, Moon, Sun } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/providers/toast-provider"; // Ensure this provider exists or use local state
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/language-provider";

export default function ProfilePage() {
    const { user, userData, loading, signOut } = useAuth();
    const router = useRouter();
    const { theme, toggleMode, mode } = useTheme();
    const { t } = useTranslation();
    const [phone, setPhone] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const { success, error } = useToast();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
        if (userData?.phone) {
            setPhone(userData.phone);
        }
    }, [user, loading, router, userData]);

    if (loading || !user) return null;

    const handleSave = async () => {
        if (!user) return;

        if (phone && !/^\d{8}$/.test(phone)) {
            error("Утасны дугаар буруу байна. 8 оронтой тоо оруулна уу.");
            return;
        }

        setIsSaving(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                phone,
                updatedAt: Date.now()
            });
            success("Мэдээлэл амжилттай хадгалагдлаа!");
        } catch (err) {
            console.error(err);
            error("Хадгалахад алдаа гарлаа.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen pb-24 bg-background transition-colors duration-300">
            <MobileHeader title={t("profile")} showBack />

            <div className="px-4 pt-6 space-y-6">
                {/* Profile Card */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 p-1 mb-4 shadow-lg shadow-blue-500/20">
                        <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-muted-foreground" />
                            )}
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-1">{userData?.displayName || t("profile")}</h2>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>

                {/* Theme Toggle Button */}
                <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors" onClick={toggleMode}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            {mode === "dark" ? <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <Sun className="w-5 h-5 text-orange-500" />}
                        </div>
                        <div>
                            <div className="font-bold text-foreground">{t("appearance")}</div>
                            <div className="text-xs text-muted-foreground">{mode === "dark" ? t("darkMode") : t("lightMode")}</div>
                        </div>
                    </div>
                    <div className={cn(
                        "w-12 h-6 rounded-full p-1 transition-colors duration-300 relative",
                        mode === "dark" ? "bg-blue-600" : "bg-slate-200"
                    )}>
                        <div className={cn(
                            "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300",
                            mode === "dark" ? "translate-x-6" : "translate-x-0"
                        )} />
                    </div>
                </Card>

                {/* Info Form */}
                <Card className="p-4 space-y-4">
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block ml-1">{t("email")}</label>
                        <Input icon={Mail} value={user.email || ""} disabled className="opacity-70 bg-muted/50" />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block ml-1">{t("phone")}</label>
                        <Input
                            icon={Phone}
                            value={phone}
                            placeholder={t("phonePlaceholder")}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-background"
                        />
                    </div>
                    <Button fullWidth onClick={handleSave} disabled={isSaving}>
                        {isSaving ? t("saving") : t("save")}
                    </Button>
                </Card>

                <Button
                    variant="outline"
                    fullWidth
                    className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => signOut()}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("logout")}
                </Button>
            </div>
        </div>
    );
}
