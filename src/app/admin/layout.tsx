import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminRole } from "@/config/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // 🔐 AUTHENTICATION CHECK
    const session = await auth();

    if (!session?.user) {
        // Not logged in - redirect to login
        redirect("/login?callbackUrl=/admin");
    }

    // 🔐 AUTHORIZATION CHECK - Only admins can access
    const userEmail = session.user.email;
    const role = getAdminRole(userEmail);

    if (!role) {
        // Not an admin - show access denied
        return (
            <div className="flex h-screen bg-[#0d111c] w-full items-center justify-center">
                <div className="text-center p-8">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Хандах эрхгүй</h1>
                    <p className="text-slate-400 mb-4">Таны хандах эрх хүрэлцэхгүй байна.</p>
                    <p className="text-slate-500 text-sm">Имэйл: {userEmail}</p>
                    <a
                        href="/"
                        className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Нүүр хуудас руу буцах
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0d111c] w-full overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto relative h-full">
                {/* Top decorative gradient line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                <div className="p-8 pb-20">
                    {children}
                </div>
            </main>
        </div>
    );
}

