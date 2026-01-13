import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, ShoppingCart, Shield } from "lucide-react";
import { getAdminRole, canAccess } from "@/config/admin";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Simple relative time formatter
function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Өнөөдөр";
    if (days === 1) return "Өчигдөр";
    if (days < 7) return `${days} өдрийн өмнө`;
    if (days < 30) return `${Math.floor(days / 7)} долоо хоногийн өмнө`;
    if (days < 365) return `${Math.floor(days / 30)} сарын өмнө`;
    return `${Math.floor(days / 365)} жилийн өмнө`;
}

async function getUsers() {
    try {
        // @ts-ignore
        const users = await prisma.user.findMany({
            where: {
                // @ts-ignore
                role: 'USER'
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return users.map(user => ({
            ...user,
            totalSpent: 0,
            orderCount: 0,
        }));
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
    }
}


export default async function UsersPage() {
    const session = await auth();
    const role = getAdminRole(session?.user?.email);

    if (!canAccess(role, 'users')) {
        redirect('/admin');
    }

    const users = await getUsers();

    const stats = {
        total: users.length,
        withOrders: users.filter(u => u.orderCount > 0).length,
        newThisMonth: users.filter(u => {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return new Date(u.createdAt) > monthAgo;
        }).length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        Users Management
                        <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
                            {users.length}
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Бүртгэлтэй хэрэглэгчдийг удирдах
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                            <p className="text-sm text-slate-400">Нийт хэрэглэгч</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.withOrders}</p>
                            <p className="text-sm text-slate-400">Захиалга хийсэн</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.newThisMonth}</p>
                            <p className="text-sm text-slate-400">Энэ сард шинэ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                            <tr>
                                <th className="px-4 py-3 font-medium">Хэрэглэгч</th>
                                <th className="px-4 py-3 font-medium">Имэйл</th>
                                <th className="px-4 py-3 font-medium text-center">Захиалга</th>
                                <th className="px-4 py-3 font-medium text-right">Нийт төлбөр</th>
                                <th className="px-4 py-3 font-medium">Бүртгэгдсэн</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                        Хэрэглэгч олдсонгүй
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt={user.name || "User"}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-white">
                                                            {user.name || "Нэргүй"}
                                                        </p>
                                                        {getAdminRole(user.email) === 'super_admin' && (
                                                            <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-0 text-[10px] px-1.5 h-4 flex items-center gap-1">
                                                                <Shield className="w-2.5 h-2.5" />
                                                                Admin
                                                            </Badge>
                                                        )}
                                                        {getAdminRole(user.email) === 'staff' && (
                                                            <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-0 text-[10px] px-1.5 h-4 flex items-center gap-1">
                                                                <Shield className="w-2.5 h-2.5" />
                                                                Staff
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {user.phone && (
                                                        <p className="text-xs text-slate-500">{user.phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                                                <span className="text-slate-300">{user.email}</span>
                                                {user.emailVerified && (
                                                    <Badge variant="outline" className="text-[10px] border-emerald-500/50 text-emerald-400 bg-emerald-500/10 h-4 px-1">
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {user.orderCount > 0 ? (
                                                <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-0">
                                                    {user.orderCount}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-500">0</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {user.totalSpent > 0 ? (
                                                <span className="font-medium text-emerald-400">
                                                    ₮{user.totalSpent.toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-slate-400 text-xs">
                                                {formatRelativeTime(new Date(user.createdAt))}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
