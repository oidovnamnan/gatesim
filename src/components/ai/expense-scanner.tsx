"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Expense } from "./expense-types";
import { useTranslation } from "@/providers/language-provider";

interface ExpenseScannerProps {
    onSave: (expense: Expense) => void;
}

export function ExpenseScanner({ onSave }: ExpenseScannerProps) {
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
                <Button className="rounded-full h-14 w-14 bg-black hover:bg-slate-800 text-white shadow-lg fixed bottom-24 right-6 flex items-center justify-center border-none z-40">
                    <Camera className="w-6 h-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-50 border-none max-w-sm sm:max-w-md p-0 overflow-hidden text-slate-900">
                {step === "upload" ? (
                    <div className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Camera className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-slate-900">{t("aiScanReceipt") || "Scan Receipt"}</h2>
                        <p className="text-sm text-slate-500 mb-6 max-w-[200px]">
                            Take a photo of your receipt to automatically track expenses.
                        </p>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <Button
                                variant="outline"
                                className="h-24 flex flex-col gap-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-6 h-6 text-slate-400" />
                                <span className="text-xs font-bold text-slate-600">Upload Photo</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-24 flex flex-col gap-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white"
                                onClick={() => fileInputRef.current?.click()} // Mobile camera triggers same input usually
                            >
                                <Camera className="w-6 h-6 text-slate-400" />
                                <span className="text-xs font-bold text-slate-600">Take Photo</span>
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
                        <div className="relative h-48 bg-slate-900 shrink-0">
                            {imagePreview && (
                                <img src={imagePreview} className="w-full h-full object-cover opacity-80" alt="Receipt" />
                            )}
                            <div className="absolute top-4 right-4">
                                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full" onClick={resetForm}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            {isProcessing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                    <div className="bg-white/90 backdrop-blur rounded-2xl p-4 flex flex-col items-center shadow-xl">
                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                                        <p className="text-xs font-bold text-slate-900">AI Analysis...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4 bg-white flex-1">
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500 font-bold uppercase">Merchant Value</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₮</span>
                                        <Input
                                            type="number"
                                            className="pl-7 bg-slate-50 border-slate-200 font-bold text-lg"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <Select
                                        value={formData.currency}
                                        onValueChange={(v) => setFormData({ ...formData, currency: v })}
                                    >
                                        <SelectTrigger className="w-[100px] bg-slate-50 border-slate-200 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="JPY">JPY ¥</SelectItem>
                                            <SelectItem value="USD">USD $</SelectItem>
                                            <SelectItem value="KRW">KRW ₩</SelectItem>
                                            <SelectItem value="MNT">MNT ₮</SelectItem>
                                            <SelectItem value="CNY">CNY ¥</SelectItem>
                                            <SelectItem value="EUR">EUR €</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500 font-bold uppercase">Merchant Name</Label>
                                <Input
                                    className="bg-slate-50 border-slate-200 font-bold"
                                    value={formData.merchant || ""}
                                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                                    placeholder="e.g. 7-Eleven"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500 font-bold uppercase">Date</Label>
                                    <Input
                                        type="date"
                                        className="bg-slate-50 border-slate-200 font-bold text-sm"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500 font-bold uppercase">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(v) => setFormData({ ...formData, category: v as any })}
                                    >
                                        <SelectTrigger className="bg-slate-50 border-slate-200 font-bold text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-4"
                                onClick={handleSave}
                                disabled={!formData.amount || !formData.merchant}
                            >
                                <Check className="w-5 h-5 mr-2" />
                                Save Expense
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
