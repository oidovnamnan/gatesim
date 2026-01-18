"use client";

import { useState, useEffect } from "react";
import { Trash2, TrendingUp, ShoppingBag, Utensils, Bus, Stethoscope, Ticket } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Expense } from "./expense-types";
import { ExpenseScanner } from "./expense-scanner";
import { useTranslation } from "@/providers/language-provider";

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
    Food: "bg-orange-100 text-orange-600",
    Transport: "bg-blue-100 text-blue-600",
    Shopping: "bg-pink-100 text-pink-600",
    Medical: "bg-green-100 text-green-600",
    Entertainment: "bg-purple-100 text-purple-600",
    Other: "bg-slate-100 text-slate-600"
};

export function ExpenseDashboard() {
    const { t } = useTranslation();
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
        <div className="space-y-6 pb-24">
            {/* Header / Summary Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-500/20">
                <div className="relative z-10">
                    <p className="text-blue-100 font-medium text-sm mb-1">{t("totalSpent") || "Total Spending"}</p>
                    <h2 className="text-4xl font-black tracking-tight">
                        {primaryTotal.toLocaleString()} <span className="text-xl font-bold opacity-70">{primaryCurrency}</span>
                    </h2>

                    {/* Secondary Currencies if any */}
                    {Object.keys(totalByCurrency).length > 1 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(totalByCurrency).map(([curr, amount]) => (
                                curr !== primaryCurrency && (
                                    <span key={curr} className="text-xs bg-white/10 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                        {amount.toLocaleString()} {curr}
                                    </span>
                                )
                            ))}
                        </div>
                    )}
                </div>

                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl" />
            </div>

            {/* List */}
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="font-bold text-slate-900">{t("recentExpenses") || "Recent Expenses"}</h3>
                    <span className="text-xs text-slate-500 font-medium">{expenses.length} items</span>
                </div>

                {expenses.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ShoppingBag className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-900">No expenses yet</p>
                        <p className="text-xs text-slate-500 mt-1">Scan a receipt to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {expenses.map((expense) => {
                            const Icon = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.Other;
                            const colorClass = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other;

                            return (
                                <div key={expense.id} className="group relative bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
                                    {/* Icon */}
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-900 truncate pr-2">{expense.merchant}</h4>
                                            <p className="font-black text-slate-900 tabular-nums">
                                                {expense.amount.toLocaleString()} <span className="text-xs font-bold text-slate-500">{expense.currency}</span>
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-end mt-1">
                                            <p className="text-xs text-slate-500 font-medium">{format(new Date(expense.date), 'MMM d, yyyy')}</p>
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{expense.category}</p>
                                        </div>
                                    </div>

                                    {/* Delete Action (Hidden by default, easier on mobile maybe swipe? For now just button) */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteExpense(expense.id);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Scanner FAB */}
            <ExpenseScanner onSave={addExpense} />
        </div>
    );
}
