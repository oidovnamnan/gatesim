"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    CreditCard,
    Mail,
    ChevronRight,
    Check,
    QrCode,
    Loader2,
    Shield,
    ArrowLeft
} from "lucide-react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice, getCountryFlag, cn } from "@/lib/utils";
import { createOrder } from "@/lib/db";
import { Order } from "@/types/db";
import { useAuth } from "@/providers/auth-provider";

type PaymentMethod = "qpay" | "stripe";
type Step = "details" | "payment" | "processing" | "success";

interface CheckoutPackage {
    id: string;
    title: string;
    operatorTitle: string;
    data: string;
    validityDays: number;
    price: number;
    currency: string;
    countries: string[];
    countryName: string;
}

interface CheckoutClientProps {
    pkg: CheckoutPackage;
}

export default function CheckoutClient({ pkg }: CheckoutClientProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<Step>("details");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qpay");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [orderId, setOrderId] = useState<string>("");

    const flag = getCountryFlag(pkg.countries[0]);
    const displayPrice = formatPrice(pkg.price, pkg.currency);

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handlePayment = async () => {
        if (!email) return;

        setIsLoading(true);
        setStep("processing");

        try {
            // 1. Create Order Logic
            const newOrder: Order = {
                id: "", // generated inside createOrder
                userId: user ? user.uid : "guest",
                contactEmail: email,
                totalAmount: pkg.price,
                currency: pkg.currency,
                status: 'completed', // Simulating successful payment & fulfillment
                paymentMethod: paymentMethod,
                items: [{
                    id: pkg.id,
                    name: pkg.title,
                    price: pkg.price,
                    sku: pkg.id, // Using ID as SKU for now
                    quantity: 1,
                    metadata: {
                        provider: pkg.operatorTitle,
                        country: pkg.countries[0]
                    }
                }],
                // Mock Fulfillment Data
                esimIccid: "8988291510325389",
                esimSmdpAddress: "LPA:1$smdp.io",
                esimActivationCode: "ACT-CODE-8682",
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            const createdOrder = await createOrder(newOrder);
            setOrderId(createdOrder.id);

            // Simulate Network Delay
            setTimeout(() => {
                setStep("success");
                setIsLoading(false);
            }, 2000);

        } catch (error) {
            console.error("Order failed", error);
            setIsLoading(false);
            setStep("details"); // Go back or show error
        }
    };

    if (step === "processing") {
        return (
            <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin relative z-10" />
                </div>
                <h2 className="text-slate-900 font-bold text-xl mt-6">Төлбөр шалгаж байна...</h2>
                <p className="text-slate-500 text-sm mt-2 text-center max-w-xs">
                    Та түр хүлээнэ үү. Бид таны захиалгыг баталгаажуулж байна.
                </p>
            </div>
        );
    }

    if (step === "success") {
        return (
            <div className="min-h-screen bg-[#F4F7FC] flex flex-col relative overflow-hidden">
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20"
                    >
                        <Check className="h-10 w-10 text-white" />
                    </motion.div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Амжилттай!</h1>
                    <p className="text-slate-500 mb-8 max-w-xs">
                        Таны захиалга баталгаажлаа. Имэйлээ шалгана уу.
                    </p>

                    <Card className="w-full max-w-sm bg-white border-slate-200 p-4 mb-6 shadow-sm">
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-slate-500">Захиалгын дугаар</span>
                            <span className="font-mono text-slate-900 font-bold select-all">{orderId.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Имэйл</span>
                            <span className="text-slate-900 font-medium">{email}</span>
                        </div>
                    </Card>

                    <Button
                        size="lg"
                        fullWidth
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 mb-3"
                        onClick={() => router.push("/orders")}
                    >
                        <QrCode className="h-4 w-4 mr-2" />
                        Миний захиалгууд
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => router.push("/")}
                        className="text-slate-500 hover:text-slate-900"
                    >
                        Нүүр хуудас руу буцах
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 bg-[#F4F7FC]">
            {/* Mobile Header Custom */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <h1 className="font-bold text-lg text-slate-900">Захиалга баталгаажуулах</h1>
            </div>

            <div className="p-4 space-y-6 max-w-lg mx-auto pt-6">
                {/* Product Summary */}
                <Card className="p-5 bg-white border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-3xl drop-shadow-sm">{flag}</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{pkg.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{pkg.operatorTitle}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 text-xs text-slate-500 mt-2 bg-slate-50 inline-flex px-2 py-1 rounded-md border border-slate-100">
                                <span className="font-medium text-slate-700">{pkg.data}</span>
                                <span className="text-slate-300">•</span>
                                <span className="font-medium text-slate-700">{pkg.validityDays} хоног</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">{displayPrice}</div>
                        </div>
                    </div>
                </Card>

                {/* Email Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Хүлээн авах имэйл</label>
                    <Input
                        icon={Mail}
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white border-slate-200 text-slate-900 shadow-sm focus:border-blue-500"
                        readOnly={!!user?.email}
                    />
                    <p className="text-xs text-slate-400 ml-1 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        QR код энэ хаягаар илгээгдэнэ
                    </p>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 ml-1">Төлбөрийн хэлбэр</label>

                    <div
                        onClick={() => setPaymentMethod("qpay")}
                        className={cn(
                            "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all shadow-sm",
                            paymentMethod === "qpay"
                                ? "bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500"
                                : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                                Q
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">QPay</div>
                                <div className="text-xs text-slate-500">Банкны аппаар төлөх</div>
                            </div>
                        </div>
                        {paymentMethod === "qpay" && <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                    </div>

                    <div
                        onClick={() => setPaymentMethod("stripe")}
                        className={cn(
                            "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all shadow-sm",
                            paymentMethod === "stripe"
                                ? "bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500"
                                : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-blue-700" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">Stripe / Card</div>
                                <div className="text-xs text-slate-500">Олон улсын карт</div>
                            </div>
                        </div>
                        {paymentMethod === "stripe" && <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                    </div>
                </div>

                {/* Sticky Bottom Action */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-slate-200 z-20">
                    <div className="max-w-lg mx-auto">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-500 font-medium text-sm">Нийт төлөх</span>
                            <span className="text-xl font-extrabold text-slate-900">{displayPrice}</span>
                        </div>
                        <Button
                            size="lg"
                            fullWidth
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
                            onClick={handlePayment}
                            disabled={!email}
                        >
                            Төлбөр төлөх
                            <ChevronRight className="w-5 h-5 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
