"use client";

import { Card } from "@/components/ui/card";
import {
    DollarSign,
    Users,
    ShoppingBag,
    Zap,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock Data
const stats = [
    { title: "Нийт орлого", value: "$12,345", change: "+12%", icon: DollarSign, trend: "up" },
    { title: "Идэвхтэй хэрэглэгч", value: "1,234", change: "+5%", icon: Users, trend: "up" },
    { title: "Шинэ захиалга", value: "45", change: "-2%", icon: ShoppingBag, trend: "down" },
    { title: "Идэвхтэй eSIM", value: "890", change: "+8%", icon: Zap, trend: "up" },
];

const recentOrders = [
    { id: "#ORD-001", user: "Bat-Erdene", plan: "Japan 7 Days", amount: "$12.99", status: "Completed", date: "2 mins ago" },
    { id: "#ORD-002", user: "Suren", plan: "Korea Unlimited", amount: "$19.99", status: "Processing", date: "15 mins ago" },
    { id: "#ORD-003", user: "Bold", plan: "Thailand 10 Days", amount: "$8.50", status: "Failed", date: "1 hour ago" },
    { id: "#ORD-004", user: "Naraa", plan: "Europe 30 Days", amount: "$39.99", status: "Completed", date: "2 hours ago" },
    { id: "#ORD-005", user: "Guest", plan: "China VPN", amount: "$5.99", status: "Completed", date: "3 hours ago" },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Хяналтын Самбар</h1>
                <p className="text-slate-400">Системийн ерөнхий төлөв байдал.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="p-4 bg-slate-900/50 border-slate-800 hover:border-blue-500/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <stat.icon className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-sm text-slate-500">{stat.title}</p>
                    </Card>
                ))}
            </div>

            {/* Recent Orders */}
            <Card className="bg-slate-900/50 border-slate-800 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Сүүлийн захиалгууд</h3>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        Бүгдийг харах
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-sm">
                                <th className="pb-3 pl-2">Захиалга ID</th>
                                <th className="pb-3">Хэрэглэгч</th>
                                <th className="pb-3">Багц</th>
                                <th className="pb-3">Дүн</th>
                                <th className="pb-3">Төлөв</th>
                                <th className="pb-3">Хугацаа</th>
                                <th className="pb-3"></th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-slate-300">
                            {recentOrders.map((order, i) => (
                                <tr key={i} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-2 font-mono text-blue-400">{order.id}</td>
                                    <td className="py-4 font-medium text-white">{order.user}</td>
                                    <td className="py-4">{order.plan}</td>
                                    <td className="py-4 font-mono">{order.amount}</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                                order.status === 'Processing' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-red-500/10 text-red-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-slate-500">{order.date}</td>
                                    <td className="py-4 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
