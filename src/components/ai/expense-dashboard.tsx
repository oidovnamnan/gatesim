"use client";

import { useState, useEffect } from "react";
import { Trash2, TrendingUp, ShoppingBag, Utensils, Bus, Stethoscope, Ticket, ArrowLeft, ChevronRight, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Expense } from "./expense-types";
import { ExpenseScanner } from "./expense-scanner";
import { useTranslation } from "@/providers/language-provider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Category Icons Map
const CATEGORY_ICONS: Record<string, any> = {
    Food: Utensils,
    Transport: Bus,
    Shopping: ShoppingBag,
    Medical: Stethoscope,
    Entertainment: Ticket,
    Other: TrendingUp
};

const CATEGORY_COLORS: Record<string, string> = {
    Food: "bg-orange-500/10 text-orange-600 border-orange-200/50",
    Transport: "bg-blue-500/10 text-blue-600 border-blue-200/50",
    Shopping: "bg-pink-500/10 text-pink-600 border-pink-200/50",
    Medical: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
    Entertainment: "bg-purple-500/10 text-purple-600 border-purple-200/50",
    Other: "bg-slate-500/10 text-slate-600 border-slate-200/50"
};

export function ExpenseDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [totalByCurrency, setTotalByCurrency] = useState<Record<string, number>>({});

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem("gatesim_expenses");
        if (saved) {
            try {
                setExpenses(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load expenses", e);
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem("gatesim_expenses", JSON.stringify(expenses));
        calculateTotals();
    }, [expenses]);

    const calculateTotals = () => {
        const totals: Record<string, number> = {};
        expenses.forEach(exp => {
            const curr = exp.currency || "JPY";
            totals[curr] = (totals[curr] || 0) + exp.amount;
        });
        setTotalByCurrency(totals);
    };

    const addExpense = (newExpense: Expense) => {
        setExpenses(prev => [newExpense, ...prev]);
    };

    const deleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    // Get primary total (first currency found or JPY)
    const primaryCurrency = Object.keys(totalByCurrency)[0] || "JPY";
    const primaryTotal = totalByCurrency[primaryCurrency] || 0;

    return (
        <div className="relative selection:bg-blue-100 pb-10 bg-slate-50 min-h-screen">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <motion.div
                    animate={{ x: [0, 40, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -left-20 w-80 h-80 bg-blue-400/10 blur-[100px] rounded-full"
                />
                <motion.div
                    animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-1/3 -right-20 w-72 h-72 bg-indigo-400/10 blur-[100px] rounded-full"
                />
            </div>

            {/* Premium Header */}
            <header className="relative z-10 px-6 pt-10 pb-6">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ x: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push("/ai")}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-black tracking-tighter text-slate-900">
                            Budget Tracker
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5">
                            AI Expense Control
                        </p>
                    </div>
                    {expenses.length > 0 && (
                        <ExpenseScanner
                            onSave={addExpense}
                            trigger={
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20"
                                >
                                    <Plus className="w-5 h-5" />
                                </motion.button>
                            }
                        />
                    )}
                </div>
            </header>

            <div className="relative z-10 px-6 space-y-8 pb-32">
                {/* Visual Summary Card - High End */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {t("totalSpent") || "Total Expenditure"}
                            </p>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <h2 className="text-5xl font-black tracking-tighter tabular-nums">
                                {primaryTotal.toLocaleString()}
                            </h2>
                            <span className="text-xl font-black text-blue-400 italic">{primaryCurrency}</span>
                        </div>

                        {/* Secondary Currencies */}
                        {Object.keys(totalByCurrency).length > 1 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {Object.entries(totalByCurrency).map(([curr, amount]) => (
                                    curr !== primaryCurrency && (
                                        <div key={curr} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md flex items-center gap-2">
                                            <span className="text-[10px] font-black text-white">{amount.toLocaleString()}</span>
                                            <span className="text-[10px] font-black text-slate-500 italic">{curr}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Artistic Glows */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[80px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 blur-[60px] -ml-24 -mb-24" />
                </motion.div>

                {/* Expenses List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-6 bg-blue-600 rounded-full" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {t("recentExpenses") || "Recent History"}
                            </h3>
                        </div>
                        <Badge variant="outline" className="bg-white border-slate-100 text-[10px] font-black text-slate-400 py-0.5 h-auto">
                            {expenses.length} ITEMS
                        </Badge>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {expenses.length === 0 ? (
                            <ExpenseScanner
                                onSave={addExpense}
                                trigger={
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full text-center py-16 bg-white/40 backdrop-blur-xl rounded-[32px] border border-dashed border-slate-200 hover:bg-white/60 hover:border-blue-200 hover:shadow-lg transition-all group cursor-pointer"
                                    >
                                        <div className="w-16 h-16 bg-slate-100 group-hover:bg-blue-50 rounded-[22px] flex items-center justify-center mx-auto mb-4 border border-white group-hover:border-blue-100 transition-colors">
                                            <Plus className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                        <h4 className="font-black text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">No history found</h4>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 group-hover:text-blue-400 transition-colors">Tap to scan a receipt</p>
                                    </motion.button>
                                }
                            />
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {expenses.map((expense, idx) => {
                                    const Icon = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.Other;
                                    const colorClass = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other;

                                    return (
                                        <motion.div
                                            key={expense.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group relative"
                                        >
                                            <Card className="p-4 rounded-[24px] bg-white/60 backdrop-blur-xl border border-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex items-center gap-4">
                                                <div className={cn("w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 border shadow-sm", colorClass)}>
                                                    <Icon className="w-6 h-6" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <h4 className="font-black text-slate-900 text-sm truncate pr-2 tracking-tight">
                                                            {expense.merchant}
                                                        </h4>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="font-black text-slate-900 tabular-nums">
                                                                {expense.amount.toLocaleString()}
                                                            </span>
                                                            <span className="text-[9px] font-black text-slate-400 italic uppercase">
                                                                {expense.currency}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                            {format(new Date(expense.date), 'MMM d, yyyy')}
                                                        </p>
                                                        <Badge className="bg-slate-50 text-slate-400 text-[8px] font-black uppercase py-0 h-4 border-none">
                                                            {expense.category}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => deleteExpense(expense.id)}
                                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 scale-75 group-hover:scale-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function Badge({ children, className, variant }: any) {
    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider",
            variant === 'outline' ? "border border-slate-200 text-slate-500" : "bg-blue-100 text-blue-700",
            className
        )}>
            {children}
        </span>
    );
}
