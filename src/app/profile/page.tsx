"use client";

import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUPER_ADMINS } from "@/config/admin";
import { LogOut, User, Phone, Mail, Moon, Sun, Loader2, LayoutDashboard } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/language-provider";
import { LoginForm } from "@/components/auth/login-form";
import { NotificationManager } from "@/components/profile/notification-manager";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { Lock, ChevronRight } from "lucide-react";

export default function ProfilePage() {
    const { user, userData, loading, signOut } = useAuth();
    const router = useRouter();
    const { theme, toggleMode, mode } = useTheme();
    const { t } = useTranslation();
    const [phone, setPhone] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const { success, error } = useToast();

    useEffect(() => {
        if (userData?.phone) {
            setPhone(userData.phone);
        }
    }, [userData]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-red-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background transition-colors duration-300">
                <MobileHeader title={t("login")} showBack />
                <div className="px-6 pt-12">
                    <LoginForm />
                </div>
            </div>
        );
    }

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

    const isAdmin = user?.email && SUPER_ADMINS.includes(user.email);

    const [adminTapCount, setAdminTapCount] = useState(0);

    const handleAdminTap = () => {
        const newCount = adminTapCount + 1;
        setAdminTapCount(newCount);
        if (newCount >= 5) {
            router.push("/admin");
            setAdminTapCount(0);
        }
    };

    return (
        <div className="pb-0 bg-white dark:bg-slate-950 transition-colors duration-300">
            <MobileHeader title={t("profile")} showBack />

            <div className="w-full px-4 pt-2 space-y-3 max-w-lg mx-auto">
                {/* Profile Header */}
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div
                        onClick={handleAdminTap}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 p-0.5 shadow-md cursor-pointer active:scale-95 transition-transform"
                    >
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6 text-slate-400" />
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-foreground truncate">{userData?.displayName || t("profile")}</h2>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400"
                            onClick={() => router.push("/admin")}
                        >
                            Admin
                        </Button>
                    )}
                </div>

                {/* Settings Group */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">Тохиргоо</h3>
                    <Card className="p-1 space-y-0.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        {/* Appearance */}
                        <div
                            onClick={toggleMode}
                            className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors p-3 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-slate-800 text-orange-600 dark:text-slate-400 flex items-center justify-center">
                                    {mode === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                </div>
                                <span className="font-semibold text-sm text-foreground">{t("appearance")}</span>
                            </div>
                            <div className={cn(
                                "w-10 h-6 rounded-full p-1 transition-colors duration-300 relative",
                                mode === "dark" ? "bg-slate-700" : "bg-slate-200"
                            )}>
                                <div className={cn(
                                    "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300",
                                    mode === "dark" ? "translate-x-4" : "translate-x-0"
                                )} />
                            </div>
                        </div>

                        {/* Notifications */}
                        <NotificationManager className="p-3" />

                        {/* Change Password */}
                        <div
                            onClick={() => setIsChangePasswordOpen(true)}
                            className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors p-3 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <span className="font-semibold text-sm text-foreground">Нууц үг солих</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                    </Card>
                </div>

                {/* Personal Info Group */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">Хувийн мэдээлэл</h3>
                    <Card className="p-4 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="grid gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1.5 block">{t("email")}</label>
                                <Input
                                    icon={Mail}
                                    value={user.email || ""}
                                    disabled
                                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-100 dark:text-slate-200"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1.5 block">{t("phone")}</label>
                                <div className="flex gap-2">
                                    <Input
                                        icon={Phone}
                                        value={phone}
                                        placeholder={t("phonePlaceholder")}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                                    />
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving || phone === userData?.phone}
                                        size="icon"
                                        className="shrink-0"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="text-xs font-bold">OK</div>}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="pt-2">
                    <Button
                        variant="ghost"
                        fullWidth
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => signOut()}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t("logout")}
                    </Button>
                </div>
            </div>

            <ChangePasswordDialog
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>
    );
}
