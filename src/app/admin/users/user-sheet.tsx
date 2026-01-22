"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, ShoppingCart, CreditCard } from "lucide-react";
import { UserData } from "@/types/db"; // You might need to adjust or create this type if missing
import { formatPrice } from "@/lib/utils";

// Define local interface if strict UserData isn't fully matching Page's aggregated (enriched) user
export interface EnrichedUser extends UserData {
    id: string;
    orderCount: number;
    totalSpent: number;
    orders?: any[]; // We'll pass orders list specifically for this user
}

interface UserSheetProps {
    user: EnrichedUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserSheet({ user, open, onOpenChange }: UserSheetProps) {
    if (!user) return null;

    const formattedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'N/A';

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6 text-slate-400" />
                            )}
                        </div>
                        <div className="flex flex-col text-left">
                            <span>{user.displayName || "No Name"}</span>
                            <span className="text-sm font-normal text-slate-400">{user.email}</span>
                        </div>
                    </SheetTitle>
                    <SheetDescription className="text-left">
                        User ID: <span className="font-mono text-xs bg-slate-800 px-1 py-0.5 rounded">{user.id}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <div className="text-slate-400 text-sm mb-1">Total Spent</div>
                            <div className="text-2xl font-bold text-emerald-400">{formatPrice(user.totalSpent, "MNT")}</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <div className="text-slate-400 text-sm mb-1">Total Orders</div>
                            <div className="text-2xl font-bold text-blue-400">{user.orderCount}</div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium uppercase text-slate-500 tracking-wider">Contact Info</h3>
                        <div className="space-y-3 p-4 bg-slate-800/30 rounded-xl border border-slate-800 text-sm">
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className={user.email ? "text-slate-200" : "text-slate-500"}>{user.email || "No email"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className={user.phone ? "text-slate-200" : "text-slate-500"}>{user.phone || "No phone number"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-200">Joined on {formattedDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order History (Mini List) */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium uppercase text-slate-500 tracking-wider flex justify-between items-center">
                            Recent Orders
                        </h3>

                        {user.orders && user.orders.length > 0 ? (
                            <div className="space-y-2">
                                {user.orders.map((order, i) => (
                                    <div key={order.id || i} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-200">{order.items?.[0]?.name || "Unknown Package"}</span>
                                            <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()} &bull; {order.id.slice(0, 8)}...</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-medium text-sm">{formatPrice(order.totalAmount, order.currency)}</span>
                                            <Badge variant={
                                                order.status === 'completed' || order.status === 'paid' ? 'default' :
                                                    order.status === 'failed' ? 'destructive' : 'secondary'
                                            } className="text-[10px] h-5 px-1.5 uppercase">
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500 bg-slate-800/20 rounded-xl border border-slate-800 border-dashed">
                                No orders found for this user.
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
