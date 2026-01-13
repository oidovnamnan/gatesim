"use client";

import { useFormStatus } from "react-dom";
import { updateProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useRef } from "react";
import { Loader2, Save, User as UserIcon } from "lucide-react";
import { User } from "next-auth";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Мэдээллийг шинэчлэх
        </Button>
    )
}

export function ProfileForm({ user }: { user: User }) {
    const { toast } = useToast();
    const ref = useRef<HTMLFormElement>(null);

    async function handleSubmit(formData: FormData) {
        const result = await updateProfile(null, formData);
        if (result.success) {
            toast({ title: "Амжилттай", description: "Таны мэдээлэл шинэчлэгдлээ." });
            ref.current?.reset();
        } else {
            toast({ title: "Алдаа", description: result.message, variant: "destructive" });
        }
    }

    return (
        <form action={handleSubmit} ref={ref} className="space-y-8 max-w-2xl">
            {/* Personal Info */}
            <Card className="p-6 border-white/10 bg-white/5 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Хувийн мэдээлэл</h2>
                        <p className="text-sm text-white/50">Таны нэр болон имэйл хаяг</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-300">Имэйл (Өөрчлөх боломжгүй)</Label>
                        <Input disabled value={user.email || ""} className="bg-slate-900/50 border-slate-800 text-slate-500" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300">Нэр</Label>
                        <Input
                            name="name"
                            defaultValue={user.name || ""}
                            placeholder="Таны нэр"
                            className="bg-slate-950 border-slate-800 text-white focus:ring-primary"
                        />
                    </div>
                </div>
            </Card>

            {/* Password Change */}
            <Card className="p-6 border-white/10 bg-white/5 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                        <ShieldIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Нууц үг солих</h2>
                        <p className="text-sm text-white/50">Хэрэв та Google-ээр нэвтэрсэн бол нууц үг солих шаардлагагүй</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-300">Одоогийн нууц үг</Label>
                        <Input
                            name="currentPassword"
                            type="password"
                            className="bg-slate-950 border-slate-800 text-white focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-300">Шинэ нууц үг</Label>
                        <Input
                            name="newPassword"
                            type="password"
                            className="bg-slate-950 border-slate-800 text-white focus:ring-primary"
                        />
                    </div>
                </div>
            </Card>

            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}

function ShieldIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
    )
}
