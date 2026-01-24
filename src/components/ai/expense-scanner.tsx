"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Check, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Expense } from "./expense-types";
import { useTranslation } from "@/providers/language-provider";
import { motion } from "framer-motion";

interface ExpenseScannerProps {
    onSave: (expense: Expense) => void;
    trigger?: React.ReactNode;
}

export function ExpenseScanner({ onSave, trigger }: ExpenseScannerProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"upload" | "review">("upload");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Expense>>({
        currency: "JPY",
        category: "Food",
        date: new Date().toISOString().split('T')[0]
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImagePreview(base64);
                processImage(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = async (base64Image: string) => {
        setIsProcessing(true);
        setStep("review"); // Show review screen instantly with loading state

        try {
            const res = await fetch("/api/ai/ocr", {
                method: "POST",
                body: JSON.stringify({ image: base64Image }),
            });

            if (!res.ok) throw new Error("OCR Failed");

            const data = await res.json();

            setFormData(prev => ({
                ...prev,
                merchant: data.merchant,
                amount: data.amount,
                currency: data.currency,
                category: data.category,
                date: data.date || prev.date
            }));

        } catch (error) {
            console.error("Scan error", error);
            // Fallback to manual entry if failed, keeping image
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = () => {
        if (!formData.merchant || !formData.amount) return;

        const newExpense: Expense = {
            id: Date.now().toString(),
            merchant: formData.merchant,
            amount: Number(formData.amount),
            currency: formData.currency || "JPY",
            category: (formData.category as any) || "Other",
            date: formData.date || new Date().toISOString().split('T')[0],
            imageUrl: imagePreview || undefined,
            timestamp: Date.now()
        };

        onSave(newExpense);
        setIsOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setStep("upload");
        setImagePreview(null);
        setFormData({ currency: "JPY", category: "Food", date: new Date().toISOString().split('T')[0] });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => {
            setIsOpen(open);
            if (!open) resetForm();
        }}>
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button className="rounded-full h-14 w-14 bg-slate-900 hover:bg-black text-white shadow-2xl shadow-slate-900/30 fixed bottom-28 right-6 flex items-center justify-center border-none z-40 transition-transform active:scale-95">
                        <Plus className="w-8 h-8" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-white/80 backdrop-blur-2xl border border-white/20 max-w-sm sm:max-w-md p-0 overflow-hidden text-slate-900 rounded-[32px] shadow-2xl shadow-slate-900/20">
                {step === "upload" ? (
                    <div className="p-8 flex flex-col items-center justify-center min-h-[350px] text-center relative overflow-hidden">
                        {/* Background Accents */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] -mr-16 -mt-16" />

                        <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                            <Camera className="w-8 h-8 text-white" />
                        </div>

                        <h2 className="relative z-10 text-2xl font-black mb-2 text-slate-900 tracking-tight">{t("aiScanReceipt") || "Receipt Scan"}</h2>
                        <p className="relative z-10 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8 max-w-[220px] leading-relaxed">
                            AI will analyze your receipt and track expenses automatically.
                        </p>

                        <div className="relative z-10 grid grid-cols-2 gap-3 w-full">
                            <Button
                                variant="outline"
                                className="h-28 flex flex-col gap-3 rounded-[24px] border border-slate-100 hover:border-blue-500/30 hover:bg-blue-50/50 bg-white shadow-sm transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Upload</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-28 flex flex-col gap-3 rounded-[24px] border border-slate-100 hover:border-emerald-500/30 hover:bg-emerald-50/50 bg-white shadow-sm transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                    <Camera className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Camera</span>
                            </Button>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col h-full max-h-[85vh]">
                        <div className="relative h-56 bg-slate-900 shrink-0">
                            {imagePreview && (
                                <img src={imagePreview} className="w-full h-full object-cover opacity-70" alt="Receipt" />
                            )}
                            <div className="absolute top-4 right-4 z-20">
                                <Button size="icon" variant="ghost" className="bg-black/20 text-white hover:bg-black/40 rounded-full backdrop-blur-md" onClick={resetForm}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            {isProcessing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-10 px-6">
                                    <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 flex flex-col items-center shadow-2xl border border-white/10 w-full">
                                        <div className="relative">
                                            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
                                            <Sparkles className="w-4 h-4 text-blue-300 absolute -top-1 -right-1 animate-pulse" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">AI Reasoning...</p>
                                        <div className="mt-3 w-1/2 h-0.5 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                animate={{ x: [-50, 50] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                className="w-1/2 h-full bg-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 overflow-y-auto space-y-5 bg-white flex-1 rounded-t-[32px] -mt-6 relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-1 w-4 bg-blue-600 rounded-full" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Merchant Details</h3>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[9px] text-slate-400 font-black uppercase tracking-widest pl-1">Amount & Currency</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1 group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-black transition-colors group-hover:text-blue-500">₮</div>
                                        <Input
                                            type="number"
                                            className="pl-9 h-14 bg-slate-50/50 border-slate-100 font-black text-xl rounded-2xl focus:ring-blue-500/20"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <Select
                                        value={formData.currency}
                                        onValueChange={(v) => setFormData({ ...formData, currency: v })}
                                    >
                                        <SelectTrigger className="w-[100px] h-14 bg-slate-50/50 border-slate-100 font-black rounded-2xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                            <SelectItem value="JPY">JPY ¥</SelectItem>
                                            <SelectItem value="MNT">MNT ₮</SelectItem>
                                            <SelectItem value="USD">USD $</SelectItem>
                                            <SelectItem value="KRW">KRW ₩</SelectItem>
                                            <SelectItem value="CNY">CNY ¥</SelectItem>
                                            <SelectItem value="EUR">EUR €</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[9px] text-slate-400 font-black uppercase tracking-widest pl-1">Establishment Name</Label>
                                <Input
                                    className="h-14 bg-slate-50/50 border-slate-100 font-black rounded-2xl px-4"
                                    value={formData.merchant || ""}
                                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                                    placeholder="e.g. Starbucks, 7-Eleven"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-[9px] text-slate-400 font-black uppercase tracking-widest pl-1">Date</Label>
                                    <Input
                                        type="date"
                                        className="h-12 bg-slate-50/50 border-slate-100 font-black text-xs rounded-xl"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] text-slate-400 font-black uppercase tracking-widest pl-1">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(v) => setFormData({ ...formData, category: v as any })}
                                    >
                                        <SelectTrigger className="h-12 bg-slate-50/50 border-slate-100 font-black text-xs rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                            <SelectItem value="Food">🍔 Food</SelectItem>
                                            <SelectItem value="Transport">🚕 Transport</SelectItem>
                                            <SelectItem value="Shopping">🛍️ Shopping</SelectItem>
                                            <SelectItem value="Entertainment">🎟️ Fun</SelectItem>
                                            <SelectItem value="Medical">💊 Medical</SelectItem>
                                            <SelectItem value="Other">📝 Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 bg-slate-900 border border-slate-800 hover:bg-black text-white font-black rounded-[20px] mt-4 shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all"
                                onClick={handleSave}
                                disabled={!formData.amount || !formData.merchant || isProcessing}
                            >
                                <Check className="w-5 h-5 mr-3" />
                                Sync to History
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
