
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
import { LogOut, User, Phone, Mail, Moon, Sun, Loader2, Plane, Smartphone, Settings, Lock, ChevronRight } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/language-provider";
import { LoginForm } from "@/components/auth/login-form";
import { NotificationManager } from "@/components/profile/notification-manager";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyTripsTab } from "@/components/profile/my-trips-tab";
import { MyEsimsTab } from "@/components/profile/my-esims-tab";

export default function ProfilePage() {
    const { user, userData, loading, signOut } = useAuth();
    const router = useRouter();
    const { theme, toggleMode, mode } = useTheme();
    const { t, language } = useTranslation(); // Assuming language is available
    const [phone, setPhone] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const { success, error } = useToast();
    const [adminTapCount, setAdminTapCount] = useState(0);

    const handleAdminTap = () => {
        const newCount = adminTapCount + 1;
        setAdminTapCount(newCount);
        if (newCount >= 5) {
            router.push("/admin");
            setAdminTapCount(0);
        }
    };

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

    return (
        <div className="pb-24 bg-white dark:bg-slate-950 transition-colors duration-300 min-h-screen">
            <MobileHeader title={t("profile")} showBack />

            <div className="w-full px-4 pt-2 space-y-6 max-w-4xl mx-auto">
                {/* Profile Header Card */}
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div
                        onClick={handleAdminTap}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 p-0.5 shadow-md cursor-pointer active:scale-95 transition-transform"
                    >
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-slate-400" />
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-black text-foreground truncate">{userData?.displayName || t("profile")}</h2>
                        <p className="text-sm text-muted-foreground truncate font-medium">{user.email}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => signOut()}
                    >
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>

                {/* Main Tabs */}
                <Tabs defaultValue="esims" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-6">
                        <TabsTrigger value="esims" className="py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                            <Smartphone className="w-4 h-4 mr-2" />
                            <span className="font-bold">{language === 'mn' ? "eSIM" : "My eSIMs"}</span>
                        </TabsTrigger>
                        <TabsTrigger value="trips" className="py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                            <Plane className="w-4 h-4 mr-2" />
                            <span className="font-bold">{language === 'mn' ? "Аялал" : "My Trips"}</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                            <Settings className="w-4 h-4 mr-2" />
                            <span className="font-bold">{language === 'mn' ? "Тохиргоо" : "Settings"}</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="esims" className="space-y-4 focus-visible:ring-0">
                        <MyEsimsTab />
                    </TabsContent>

                    <TabsContent value="trips" className="space-y-4 focus-visible:ring-0">
                        <MyTripsTab />
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4 focus-visible:ring-0">
                        {/* Personal Info Group */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">
                                {language === 'mn' ? "Хувийн мэдээлэл" : "Personal Info"}
                            </h3>
                            <Card className="p-4 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
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
                                                className="shrink-0 rounded-xl"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="text-xs font-bold">OK</div>}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* App Settings Group */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">
                                {language === 'mn' ? "Систем" : "System"}
                            </h3>
                            <Card className="p-1 space-y-0.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-2xl">
                                {/* Appearance */}
                                <div
                                    onClick={toggleMode}
                                    className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors p-3 rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-slate-800 text-orange-600 dark:text-slate-400 flex items-center justify-center">
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
                                    className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors p-3 rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold text-sm text-foreground">
                                            {language === 'mn' ? "Нууц үг солих" : "Change Password"}
                                        </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                </div>
                            </Card>
                        </div>

                        {isAdmin && (
                            <div className="pt-4">
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                    onClick={() => router.push("/admin")}
                                >
                                    Admin Dashboard
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            <ChangePasswordDialog
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>
    );
}

