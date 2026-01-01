"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, User, Phone, Mail } from "lucide-react";

export default function ProfilePage() {
    const { user, userData, loading, signOut } = useAuth();
    const router = useRouter();
    const [phone, setPhone] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
        if (userData?.phone) {
            setPhone(userData.phone);
        }
    }, [user, loading, router, userData]);

    if (loading || !user) return null;

    return (
        <div className="min-h-screen pb-24">
            <MobileHeader title="Миний мэдээлэл" showBack />

            <div className="px-4 pt-6 space-y-6">
                {/* Profile Card */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 p-1 mb-4">
                        <div className="w-full h-full rounded-full bg-[#11141d] flex items-center justify-center overflow-hidden">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-white/50" />
                            )}
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{userData?.displayName || "Хэрэглэгч"}</h2>
                    <p className="text-white/50 text-sm">{user.email}</p>
                </div>

                {/* Info Form */}
                <Card className="p-4 space-y-4">
                    <div>
                        <label className="text-xs text-white/50 mb-1.5 block ml-1">Имэйл хаяг</label>
                        <Input icon={Mail} value={user.email || ""} disabled className="opacity-70" />
                    </div>
                    <div>
                        <label className="text-xs text-white/50 mb-1.5 block ml-1">Утасны дугаар</label>
                        <Input
                            icon={Phone}
                            value={phone}
                            placeholder="Утасны дугаараа оруулна уу"
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <Button fullWidth>Хадгалах</Button>
                </Card>

                <Button
                    variant="outline"
                    fullWidth
                    className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => signOut()}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Гарах
                </Button>
            </div>
        </div>
    );
}
