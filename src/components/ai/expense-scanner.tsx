"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, Loader2, Check, Plus, Sparkles, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Expense, CustomCategory } from "./expense-types";
import { useTranslation } from "@/providers/language-provider";
import { motion } from "framer-motion";

interface ExpenseScannerProps {
    onSave: (expense: Expense) => void;
    trigger?: React.ReactNode;
    customCategories?: CustomCategory[];
    onAddCategory?: (category: CustomCategory) => void;
}

const PRESET_COLORS = [
    "bg-red-500/10 text-red-600 border-red-200/50",
    "bg-orange-500/10 text-orange-600 border-orange-200/50",
    "bg-amber-500/10 text-amber-600 border-amber-200/50",
    "bg-green-500/10 text-green-600 border-green-200/50",
    "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
    "bg-teal-500/10 text-teal-600 border-teal-200/50",
    "bg-cyan-500/10 text-cyan-600 border-cyan-200/50",
    "bg-blue-500/10 text-blue-600 border-blue-200/50",
    "bg-indigo-500/10 text-indigo-600 border-indigo-200/50",
    "bg-violet-500/10 text-violet-600 border-violet-200/50",
    "bg-purple-500/10 text-purple-600 border-purple-200/50",
    "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-200/50",
    "bg-pink-500/10 text-pink-600 border-pink-200/50",
    "bg-rose-500/10 text-rose-600 border-rose-200/50",
];

export function ExpenseScanner({ onSave, trigger, customCategories = [], onAddCategory }: ExpenseScannerProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryEmoji, setNewCategoryEmoji] = useState("✨");

    const [step, setStep] = useState<"upload" | "review">("upload");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Expense>>({
        currency: "MNT",
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
            setError(t("error") || "Scan failed. Please enter manually.");
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
            currency: formData.currency || "MNT",
            category: formData.category || "Other",
            date: formData.date || new Date().toISOString().split('T')[0],
            imageUrl: imagePreview || undefined,
            timestamp: Date.now()
        };

        onSave(newExpense);
        setIsOpen(false);
        resetForm();
    };

    const handleCreateCategory = () => {
        if (!newCategoryName || !onAddCategory) return;

        const randomColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];

        const newCat: CustomCategory = {
            id: Date.now().toString(),
            name: newCategoryName,
            emoji: newCategoryEmoji,
            color: randomColor
        };

        onAddCategory(newCat);
        setFormData({ ...formData, category: newCategoryName });
        setCreateCategoryOpen(false);
        setNewCategoryName("");
        setNewCategoryEmoji("✨");
    };

    const resetForm = () => {
        setStep("upload");
        setImagePreview(null);
        setError(null);
        setFormData({ currency: "MNT", category: "Food", date: new Date().toISOString().split('T')[0] });
    };

    // Auto-suggest emoji based on name (Super simple logic for now)
    useEffect(() => {
        const lower = newCategoryName.toLowerCase();
        if (lower.includes("beer") || lower.includes("drink")) setNewCategoryEmoji("🍺");
        else if (lower.includes("game") || lower.includes("play")) setNewCategoryEmoji("🎮");
        else if (lower.includes("home") || lower.includes("house")) setNewCategoryEmoji("🏠");
        else if (lower.includes("book") || lower.includes("read")) setNewCategoryEmoji("📚");
        else if (lower.includes("gym") || lower.includes("fit")) setNewCategoryEmoji("💪");
        else if (lower.includes("gift")) setNewCategoryEmoji("🎁");
        else if (lower.includes("pet") || lower.includes("dog") || lower.includes("cat")) setNewCategoryEmoji("🐾");
        else if (lower.includes("work") || lower.includes("job")) setNewCategoryEmoji("💼");
        else if (lower.length > 0) setNewCategoryEmoji("✨");
    }, [newCategoryName]);

    if (createCategoryOpen) {
        return (
            <Dialog open={createCategoryOpen} onOpenChange={setCreateCategoryOpen}>
                <DialogContent className="bg-white/90 backdrop-blur-2xl border border-white/20 p-6 rounded-[32px] shadow-2xl max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-center font-black text-slate-900">{t("newCategory")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-center">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-6xl shadow-inner">
                                {newCategoryEmoji}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase text-[10px] font-black tracking-widest text-slate-400 pl-1">{t("categoryName")}</Label>
                            <Input
                                placeholder="e.g. Gaming"
                                className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                        </div>
                        <Button
                            className="w-full h-12 bg-black text-white rounded-xl font-bold"
                            onClick={handleCreateCategory}
                            disabled={!newCategoryName}
                        >
                            {t("createCategory")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

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
            <DialogContent className="bg-white/80 backdrop-blur-2xl border border-white/20 max-w-sm sm:max-w-md p-0 overflow-hidden text-slate-900 rounded-[32px] shadow-2xl shadow-slate-900/20" aria-describedby={undefined}>
                <DialogHeader className="sr-only">
                    <DialogTitle>{t("aiScanReceipt")}</DialogTitle>
                </DialogHeader>

                {step === "upload" ? (
                    <div className="p-8 flex flex-col items-center justify-center min-h-[350px] text-center relative overflow-hidden">
                        {/* Background Accents */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] -mr-16 -mt-16" />

                        <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                            <Camera className="w-8 h-8 text-white" />
                        </div>

                        <h2 className="relative z-10 text-2xl font-black mb-2 text-slate-900 tracking-tight">{t("aiScanReceipt")}</h2>
                        <p className="relative z-10 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8 max-w-[220px] leading-relaxed">
                            {t("aiScanDesc")}
                        </p>

                        <div className="relative z-10 grid grid-cols-3 gap-3 w-full">
                            <Button
                                variant="outline"
                                className="h-28 flex flex-col gap-3 rounded-[24px] border border-slate-100 hover:border-blue-500/30 hover:bg-blue-50/50 bg-white shadow-sm transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t("upload")}</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-28 flex flex-col gap-3 rounded-[24px] border border-slate-100 hover:border-emerald-500/30 hover:bg-emerald-50/50 bg-white shadow-sm transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                    <Camera className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t("camera")}</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-28 flex flex-col gap-3 rounded-[24px] border border-slate-100 hover:border-purple-500/30 hover:bg-purple-50/50 bg-white shadow-sm transition-all group"
                                onClick={() => {
                                    setStep("review");
                                    setFormData({ currency: "MNT", category: "Food", date: new Date().toISOString().split('T')[0] });
                                }}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                    <Edit2 className="w-5 h-5 text-slate-400 group-hover:text-purple-600" />
                                </div>
                                <span className="text-center text-[9px] font-black uppercase tracking-widest text-slate-500">{t("manual")}</span>
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
                            {error && (
                                <div className="absolute top-4 left-4 right-14 z-20 bg-red-500/90 text-white px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-4">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="p-8 overflow-y-auto space-y-5 bg-white flex-1 rounded-t-[32px] -mt-6 relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-1 w-4 bg-blue-600 rounded-full" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("merchantDetails")}</h3>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[9px] text-slate-400 font-black uppercase tracking-widest pl-1">{t("amountAndCurrency")}</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1 group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-black transition-colors group-hover:text-blue-500">₮</div>
                                        <Input
                                            type="number"
                                            inputMode="decimal"
                                            pattern="[0-9]*"
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
                                            <SelectItem value="MNT">MNT ₮</SelectItem>
                                            <SelectItem value="JPY">JPY ¥</SelectItem>
                                            <SelectItem value="USD">USD $</SelectItem>
                                            <SelectItem value="KRW">KRW ₩</SelectItem>
                                            <SelectItem value="CNY">CNY ¥</SelectItem>
                                            <SelectItem value="EUR">EUR €</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[9px] text-slate-400 font-black uppercase tracking-widest pl-1">{t("establishmentName")}</Label>
                                <Input
                                    className="h-14 bg-slate-50/50 border-slate-100 font-black rounded-2xl px-4"
                                    value={formData.merchant || ""}
                                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                                    placeholder="e.g. Starbucks, 7-Eleven"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-[9px] text-slate-400 font-black uppercase tracking-widest pl-1">{t("date")}</Label>
                                    <Input
                                        type="date"
                                        className="h-12 bg-slate-50/50 border-slate-100 font-black text-xs rounded-xl"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] text-slate-400 font-black uppercase tracking-widest pl-1">{t("adminRoles")}</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(v) => {
                                            if (v === "CREATE_NEW") {
                                                setCreateCategoryOpen(true);
                                            } else {
                                                setFormData({ ...formData, category: v as any });
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-12 bg-slate-50/50 border-slate-100 font-black text-xs rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[300px]">
                                            <SelectItem value="Food">🍔 Food</SelectItem>
                                            <SelectItem value="Transport">🚕 Transport</SelectItem>
                                            <SelectItem value="Flight">✈️ Flight</SelectItem>
                                            <SelectItem value="Hotel">🏨 Hotel</SelectItem>
                                            <SelectItem value="Shopping">🛍️ Shopping</SelectItem>
                                            <SelectItem value="Entertainment">🎟️ Fun</SelectItem>
                                            <SelectItem value="Medical">💊 Medical</SelectItem>
                                            <SelectItem value="Other">📝 Other</SelectItem>

                                            {customCategories.length > 0 && (
                                                <>
                                                    <div className="h-px bg-slate-100 my-1 mx-2" />
                                                    <p className="text-[9px] font-black text-slate-400 px-2 py-1 uppercase tracking-widest">Custom</p>
                                                    {customCategories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.name}>
                                                            {cat.emoji} {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </>
                                            )}

                                            {onAddCategory && (
                                                <>
                                                    <div className="h-px bg-slate-100 my-1 mx-2" />
                                                    <SelectItem value="CREATE_NEW" className="text-blue-600 font-bold">
                                                        <Plus className="w-3 h-3 mr-2 inline" /> {t("createCategory") || "Create New..."}
                                                    </SelectItem>
                                                </>
                                            )}
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
                                {t("syncToHistory")}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
