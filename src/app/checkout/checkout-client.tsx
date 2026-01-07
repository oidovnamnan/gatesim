"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    CreditCard,
    Mail,
    ChevronRight,
    Check,
    QrCode,
    Loader2,
    Shield,
    ArrowLeft,
    Smartphone,
    RefreshCw,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice, getCountryFlag, cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type PaymentMethod = "qpay" | "stripe";
type Step = "details" | "qr" | "processing" | "success" | "error";

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

interface QPayInvoice {
    invoiceId: string;
    qrImage: string;
    qrText: string;
    shortUrl: string;
    deeplinks: Array<{
        name: string;
        description: string;
        logo: string;
        link: string;
    }>;
    amountMNT: number;
}

// Bank logos mapping
const bankLogos: Record<string, string> = {
    "Khan Bank": "🏦",
    "Golomt Bank": "🏛️",
    "TDB": "🏢",
    "State Bank": "🏤",
    "Xac Bank": "💳",
    "M Bank": "📱",
    "Bogd Bank": "🏰",
    "Arig Bank": "🦁",
    "Chinggis Khaan Bank": "👑",
    "Most Money": "💰",
    "SocialPay": "📲",
};

export default function CheckoutClient({ pkg }: CheckoutClientProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<Step>("details");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qpay");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [orderId, setOrderId] = useState<string>("");
    const [invoice, setInvoice] = useState<QPayInvoice | null>(null);
    const [error, setError] = useState<string>("");
    const [checkCount, setCheckCount] = useState(0);

    const flag = getCountryFlag(pkg.countries[0]);
    const displayPrice = formatPrice(pkg.price, pkg.currency);

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    // Create QPay invoice
    const createQPayInvoice = async () => {
        if (!email) return;

        setIsLoading(true);
        setError("");

        try {
            // Generate order ID
            const newOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            setOrderId(newOrderId);

            // 1. Create Order in DB
            const orderPayload = {
                id: newOrderId,
                contactEmail: email,
                totalAmount: pkg.price,
                currency: pkg.currency,
                status: 'pending',
                paymentMethod: 'qpay',
                items: [{
                    id: pkg.id,
                    sku: pkg.id,
                    name: pkg.title,
                    price: pkg.price,
                    quantity: 1,
                    metadata: {
                        operator: pkg.operatorTitle,
                        data: pkg.data,
                        validity: pkg.validityDays,
                        country: pkg.countryName
                    },
                    countries: pkg.countries
                }]
            };

            const createOrderRes = await fetch("/api/orders/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderPayload)
            });

            if (!createOrderRes.ok) {
                const errData = await createOrderRes.json();
                throw new Error(errData.error || "Захиалга үүсгэхэд алдаа гарлаа");
            }

            // 2. Create QPay invoice
            const response = await fetch("/api/checkout/qpay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: newOrderId,
                    amount: pkg.price,
                    currency: pkg.currency,
                    description: `${pkg.title} - ${pkg.data} - ${pkg.validityDays} хоног`,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Нэхэмжлэх үүсгэхэд алдаа гарлаа");
            }

            setInvoice({
                invoiceId: data.invoiceId,
                qrImage: data.qrImage,
                qrText: data.qrText,
                shortUrl: data.shortUrl,
                deeplinks: data.deeplinks || [],
                amountMNT: data.amountMNT,
            });

            setStep("qr");
        } catch (err) {
            console.error("QPay invoice error:", err);
            setError(err instanceof Error ? err.message : "Алдаа гарлаа");
            setStep("error");
        } finally {
            setIsLoading(false);
        }
    };

    // Check payment status
    const checkPaymentStatus = useCallback(async () => {
        if (!invoice?.invoiceId || !orderId) return false;

        try {
            const response = await fetch(`/api/checkout/qpay?invoiceId=${invoice.invoiceId}&orderId=${orderId}`);
            const data = await response.json();

            if (data.isPaid) {
                setStep("processing");
                // Short delay before showing success
                setTimeout(() => {
                    setStep("success");
                }, 2000);
                return true;
            }
            return false;
        } catch (err) {
            console.error("Payment check error:", err);
            return false;
        }
    }, [invoice?.invoiceId, orderId]);

    // Poll for payment status
    useEffect(() => {
        if (step !== "qr" || !invoice?.invoiceId) return;

        const interval = setInterval(async () => {
            setCheckCount(c => c + 1);
            const paid = await checkPaymentStatus();
            if (paid) {
                clearInterval(interval);
            }
        }, 3000); // Check every 3 seconds

        // Stop polling after 10 minutes
        const timeout = setTimeout(() => {
            clearInterval(interval);
        }, 10 * 60 * 1000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [step, invoice?.invoiceId, checkPaymentStatus]);

    // Error state
    if (step === "error") {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">❌</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Алдаа гарлаа</h1>
                <p className="text-slate-500 mb-6 max-w-xs">{error}</p>
                <Button onClick={() => setStep("details")} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Буцах
                </Button>
            </div>
        );
    }

    // Processing state
    if (step === "processing") {
        return (
            <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                    <Loader2 className="h-12 w-12 text-green-600 animate-spin relative z-10" />
                </div>
                <h2 className="text-slate-900 font-bold text-xl mt-6">Төлбөр амжилттай!</h2>
                <p className="text-slate-500 text-sm mt-2 text-center max-w-xs">
                    eSIM-ийг бэлтгэж байна...
                </p>
            </div>
        );
    }

    // Success state
    if (step === "success") {
        return (
            <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
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
                            <span className="font-mono text-slate-900 font-bold select-all">
                                {orderId.slice(0, 12).toUpperCase()}
                            </span>
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
                        onClick={() => router.push("/my-esims")}
                    >
                        <QrCode className="h-4 w-4 mr-2" />
                        Миний eSIM-үүд
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

    // QR Code step
    if (step === "qr" && invoice) {
        return (
            <div className="min-h-screen bg-background pb-6">
                {/* Header */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setStep("details")}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <h1 className="font-bold text-lg text-slate-900">QPay төлбөр</h1>
                </div>

                <div className="p-4 space-y-4 max-w-lg mx-auto">
                    {/* Amount */}
                    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <div className="text-center">
                            <p className="text-sm text-slate-600 mb-1">Төлөх дүн</p>
                            <p className="text-3xl font-bold text-blue-600">
                                ₮{invoice.amountMNT.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{displayPrice}</p>
                        </div>
                    </Card>

                    {/* QR Code */}
                    <Card className="p-6 bg-white border-slate-200">
                        <div className="flex flex-col items-center">
                            <p className="text-sm text-slate-600 mb-4 flex items-center gap-2">
                                <QrCode className="w-4 h-4" />
                                QR код уншуулах
                            </p>

                            {invoice.qrImage ? (
                                <div className="w-48 h-48 bg-white rounded-lg border-2 border-slate-100 flex items-center justify-center p-2">
                                    <img
                                        src={invoice.qrImage.startsWith("http")
                                            ? invoice.qrImage
                                            : invoice.qrImage.startsWith("data:")
                                                ? invoice.qrImage
                                                : `data:image/png;base64,${invoice.qrImage}`}
                                        alt="QPay QR Code"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <QrCode className="w-20 h-20 text-slate-300" />
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                                <RefreshCw className={cn("w-3 h-3", checkCount > 0 && "animate-spin")} />
                                Төлбөр хүлээж байна... ({checkCount})
                            </div>
                        </div>
                    </Card>

                    {/* Bank Deeplinks */}
                    {invoice.deeplinks && invoice.deeplinks.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Smartphone className="w-4 h-4" />
                                Банкны аппаар төлөх
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {invoice.deeplinks.slice(0, 9).map((bank, index) => (
                                    <a
                                        key={index}
                                        href={bank.link}
                                        className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                                    >
                                        {bank.logo ? (
                                            <div className="w-10 h-10 relative mb-1">
                                                <img
                                                    src={bank.logo}
                                                    alt={bank.name}
                                                    className="w-full h-full object-contain rounded-lg"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerText = bankLogos[bank.name] || "🏦";
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-2xl mb-1">
                                                {bankLogos[bank.name] || "🏦"}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">
                                            {bank.description || bank.name}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Manual check button */}
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={checkPaymentStatus}
                        className="mt-4"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Төлбөр шалгах
                    </Button>
                </div>
            </div>
        );
    }

    // Details step (default)
    return (
        <div className="min-h-screen pb-32 bg-background">
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
                        className={cn(
                            "bg-white border-slate-200 text-slate-900 shadow-sm focus:border-blue-500",
                            email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "border-red-300 focus:border-red-500 bg-red-50" : ""
                        )}
                        readOnly={!!user?.email}
                    />
                    {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (
                        <p className="text-xs text-red-500 ml-1 flex items-center gap-1 font-medium">
                            Буруу форматтай имэйл байна
                        </p>
                    ) : (
                        <p className="text-xs text-slate-400 ml-1 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            QR код энэ хаягаар илгээгдэнэ
                        </p>
                    )}
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
                        className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all shadow-sm opacity-60 cursor-not-allowed bg-slate-50 border-slate-100"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-500 flex items-center gap-2">
                                    Stripe / Card
                                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">Тун удахгүй</span>
                                </div>
                                <div className="text-xs text-slate-400">Олон улсын карт</div>
                            </div>
                        </div>
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
                            className={cn(
                                "font-bold shadow-lg transition-all",
                                !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                                    ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                            )}
                            onClick={createQPayInvoice}
                            disabled={!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Уншиж байна...
                                </>
                            ) : (
                                <>
                                    Төлбөр төлөх
                                    <ChevronRight className="w-5 h-5 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
