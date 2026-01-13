import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Миний Профайл</h1>
                <p className="text-slate-400">Хувийн мэдээлэл болон нууц үгийн тохиргоо</p>
            </div>
            <ProfileForm user={session.user} />
        </div>
    );
}
