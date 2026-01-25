"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
    ExternalLink,
    AlertCircle,
    UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice, getCountryFlag, cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useTranslation } from "@/providers/language-provider";
import { useGuestOrderStore } from "@/store/guest-order-store";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

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
    isTopUp?: boolean;
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

export default function CheckoutClient({ pkg }: CheckoutClientProps) {
    const { t, language } = useTranslation();
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
    const [userOrders, setUserOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    // Fetch user orders for safety check
    useEffect(() => {
        if (!user) {
            setOrdersLoading(false);
            return;
        }

        const ordersRef = collection(db, "orders");
        const q = query(
            ordersRef,
            where("userId", "==", user.uid),
            where("status", "in", ["COMPLETED", "PAID", "PROVISIONING"])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserOrders(orders);
            setOrdersLoading(false);
        }, (err) => {
            console.error("Checkout orders fetch error:", err);
            setOrdersLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Safety validation
    const { canProceed, restrictedReason } = useMemo(() => {
        if (!pkg.isTopUp) return { canProceed: true, restrictedReason: null };
        if (!user) return { canProceed: false, restrictedReason: "LOGIN_REQUIRED" };
        if (ordersLoading) return { canProceed: false, restrictedReason: "LOADING" };

        if (userOrders.length === 0) return { canProceed: false, restrictedReason: "NO_ESIM" };

        const hasMatchingProvider = userOrders.some(order => {
            const items = order.items || [];
            return items.some((item: any) => {
                const operator = item.metadata?.operator || "";
                return operator.toLowerCase().includes(pkg.operatorTitle.toLowerCase()) ||
                    pkg.operatorTitle.toLowerCase().includes(operator.toLowerCase());
            });
        });

        if (!hasMatchingProvider) return { canProceed: false, restrictedReason: "PROVIDER_MISMATCH" };

        return { canProceed: true, restrictedReason: null };
    }, [pkg.isTopUp, user, userOrders, ordersLoading, pkg.operatorTitle]);

    // Dynamic translation helpers
    const getTranslatedCountryName = (code: string, defaultName: string) => {
        const key = `country_${code.toUpperCase()}`;
        const translated = t(key);
        return translated === key ? defaultName : translated;
    };

    const countryName = getTranslatedCountryName(pkg.countries[0], pkg.countryName);

    // Dynamic Title for regional packages
    let displayTitle = pkg.title;
    if (pkg.countries.length > 1) {
        displayTitle = `${countryName} ${t("plusCountries").replace("{count}", (pkg.countries.length - 1).toString())}`;
    }

    // Lock to prevent multiple success triggers / flickering
    const isLockedRef = useRef(false);

    const flag = getCountryFlag(pkg.countries[0]);
    const displayPrice = formatPrice(pkg.price, pkg.currency);

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    // Create QPay invoice
    const createQPayInvoice = async () => {
        if (!email || !canProceed) return;

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
                        country: countryName
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
                throw new Error(errData.error || t("error"));
            }

            // 2. Create QPay invoice
            const response = await fetch("/api/checkout/qpay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: newOrderId,
                    amount: pkg.price,
                    currency: pkg.currency,
                    description: `${pkg.title} - ${pkg.data} - ${pkg.validityDays} ${t("day")}`,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || t("error"));
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
            setError(err instanceof Error ? err.message : t("error"));
            setStep("error");
        } finally {
            setIsLoading(false);
        }
    };

    // Check payment status
    const checkPaymentStatus = useCallback(async () => {
        if (!invoice?.invoiceId || !orderId) return false;

        // HARD LOCK: If we already confirmed payment, NEVER check again.
        if (isLockedRef.current) return true;
        if (step === "processing" || step === "success") return true;

        try {
            const response = await fetch(`/api/checkout/qpay?invoiceId=${invoice.invoiceId}&orderId=${orderId}`);
            if (!response.ok) return false;
            const data = await response.json();

            if (data.isPaid) {
                if (isLockedRef.current) return true;
                isLockedRef.current = true;
                setStep("processing");
                useGuestOrderStore.getState().addOrderId(orderId);
                setTimeout(() => { setStep("success"); }, 2000);
                return true;
            }
            return false;
        } catch (err) {
            console.error("Payment check error:", err);
            return false;
        }
    }, [invoice?.invoiceId, orderId, step]);

    // Poll for payment status
    useEffect(() => {
        if (step !== "qr" || !invoice?.invoiceId) return;
        const interval = setInterval(async () => {
            setCheckCount(c => c + 1);
            const paid = await checkPaymentStatus();
            if (paid) clearInterval(interval);
        }, 3000);
        const timeout = setTimeout(() => { clearInterval(interval); }, 10 * 60 * 1000);
        return () => { clearInterval(interval); clearTimeout(timeout); };
    }, [step, invoice?.invoiceId, checkPaymentStatus]);

    // Render logic per step
    if (step === "error") {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"><span className="text-3xl">❌</span></div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">{t("error")}</h1>
                <p className="text-slate-500 mb-6 max-w-xs">{error}</p>
                <Button onClick={() => setStep("details")} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />{t("back")}</Button>
            </div>
        );
    }

    if (step === "processing") {
        return (
            <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                    <Loader2 className="h-12 w-12 text-green-600 animate-spin relative z-10" />
                </div>
                <h2 className="text-slate-900 font-bold text-xl mt-6">{t("paymentSuccess")}</h2>
                <p className="text-slate-500 text-sm mt-2 text-center max-w-xs">{t("preparingEsim")}</p>
            </div>
        );
    }

    if (step === "success") {
        return (
            <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20"><Check className="h-10 w-10 text-white" /></motion.div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{t("success")}!</h1>
                    <p className="text-slate-500 mb-8 max-w-xs">{t("orderConfirmed")}</p>
                    <Card className="w-full max-w-sm bg-white border-slate-200 p-4 mb-6 shadow-sm">
                        <div className="flex justify-between items-center text-sm mb-2"><span className="text-slate-500">{t("orderNumber")}</span><span className="font-mono text-slate-900 font-bold select-all">{orderId.slice(0, 12).toUpperCase()}</span></div>
                        <div className="flex justify-between items-center text-sm"><span className="text-slate-500">{t("email")}</span><span className="text-slate-900 font-medium">{email}</span></div>
                    </Card>
                    <Button size="lg" fullWidth className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 mb-3" onClick={() => router.push("/my-esims")}><QrCode className="h-4 w-4 mr-2" />{t("myEsims")}</Button>
                    <Button variant="ghost" onClick={() => router.push("/")} className="text-slate-500 hover:text-slate-900">{t("backToHome")}</Button>
                </div>
            </div>
        );
    }

    if (step === "qr" && invoice) {
        return (
            <div className="min-h-screen bg-background pb-6">
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3"><button onClick={() => setStep("details")} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"><ArrowLeft className="w-5 h-5 text-slate-700" /></button><h1 className="font-bold text-lg text-slate-900">QPay {t("success")}</h1></div>
                <div className="p-4 space-y-4 max-w-lg mx-auto">
                    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"><div className="text-center"><p className="text-sm text-slate-600 mb-1">{t("totalAmount")}</p><p className="text-3xl font-bold text-blue-600">₮{invoice.amountMNT.toLocaleString()}</p><p className="text-xs text-slate-500 mt-1">{displayPrice}</p></div></Card>
                    <Card className="p-6 bg-white border-slate-200"><div className="flex flex-col items-center"><p className="text-sm text-slate-600 mb-4 flex items-center gap-2"><QrCode className="w-4 h-4" />{t("qrScanInstructions")}</p>{invoice.qrImage ? (<div className="w-48 h-48 bg-white rounded-lg border-2 border-slate-100 flex items-center justify-center p-2"><img src={invoice.qrImage.startsWith("http") ? invoice.qrImage : invoice.qrImage.startsWith("data:") ? invoice.qrImage : `data:image/png;base64,${invoice.qrImage}`} alt="QPay QR Code" className="w-full h-full object-contain" /></div>) : (<div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center"><QrCode className="w-20 h-20 text-slate-300" /></div>)}<div className="flex items-center gap-2 mt-4 text-xs text-slate-500"><RefreshCw className={cn("w-3 h-3", checkCount > 0 && "animate-spin")} />{t("waitingPayment")} ({checkCount})</div></div></Card>
                    {invoice.deeplinks && invoice.deeplinks.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-700 flex items-center gap-2"><Smartphone className="w-4 h-4" />{t("bankAppPay")}</p>
                            <div className="grid grid-cols-2 gap-3">
                                {invoice.deeplinks.map((bank, index) => (
                                    <a
                                        key={index}
                                        href={bank.link}
                                        className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center gap-3 hover:border-blue-300 hover:bg-blue-50 transition-all group shadow-sm text-left w-full"
                                    >
                                        <div className="w-11 h-11 relative flex-shrink-0 flex items-center justify-center bg-white rounded-xl overflow-hidden border border-slate-100 shadow-inner">
                                            <img
                                                src={bank.logo}
                                                alt={bank.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerText = "🏦";
                                                        parent.className = "w-11 h-11 flex items-center justify-center text-lg";
                                                    }
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-black text-slate-700 truncate group-hover:text-blue-600 transition-colors leading-tight">
                                            {bank.name}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                    <Button variant="outline" fullWidth onClick={checkPaymentStatus} className="mt-4"><RefreshCw className="w-4 h-4 mr-2" />{t("checkPayment")}</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 bg-background">
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3"><button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"><ArrowLeft className="w-5 h-5 text-slate-700" /></button><h1 className="font-bold text-lg text-slate-900">{t("checkoutTitle")}</h1></div>
            <div className="p-4 space-y-6 max-w-lg mx-auto pt-6">
                <Card className="p-5 bg-white border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-1"><span className="text-3xl drop-shadow-sm">{flag}</span><div><h3 className="font-bold text-slate-900 text-lg leading-tight">{displayTitle}</h3><p className="text-xs text-slate-500 font-medium">{pkg.operatorTitle}</p></div></div>
                            <div className="flex gap-2 text-xs text-slate-500 mt-2 bg-slate-50 inline-flex px-2 py-1 rounded-md border border-slate-100"><span className="font-medium text-slate-700">{pkg.data}</span><span className="text-slate-300">•</span><span className="font-medium text-slate-700">{pkg.validityDays} {t("day")}</span></div>
                        </div>
                        <div className="text-right"><div className="text-xl font-bold text-blue-600">{displayPrice}</div></div>
                    </div>
                </Card>

                {/* Safety Restriction UI */}
                {!canProceed && !ordersLoading && (
                    <div className="p-5 rounded-2xl bg-red-50 border border-red-100 flex flex-col gap-4 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="bg-red-100 p-2.5 rounded-xl">
                                {restrictedReason === "LOGIN_REQUIRED" ? (<UserCircle className="h-6 w-6 text-red-600" />) : (<AlertCircle className="h-6 w-6 text-red-600" />)}
                            </div>
                            <div>
                                <h3 className="font-bold text-red-900 mb-1">{restrictedReason === "LOGIN_REQUIRED" ? t("loginRequired") : t("incompatible")}</h3>
                                <p className="text-xs text-red-700/80 leading-relaxed font-medium">
                                    {restrictedReason === "LOGIN_REQUIRED" ? t("topUpLoginRequired") || "You must be logged in to purchase a top-up." : restrictedReason === "NO_ESIM" ? t("topUpNoEsimError") : t("topUpProviderError").replace("{provider}", pkg.operatorTitle)}
                                </p>
                            </div>
                        </div>
                        {restrictedReason === "LOGIN_REQUIRED" ? (
                            <Link href="/profile"><Button fullWidth className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-12">{t("login")}</Button></Link>
                        ) : (
                            <Link href="/packages"><Button fullWidth variant="outline" className="border-red-200 text-red-600 hover:bg-red-100/50 font-bold rounded-xl h-12">{t("viewPackages")}</Button></Link>
                        )}
                    </div>
                )}

                {canProceed && (
                    <>
                        {pkg.isTopUp && (
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-sm">
                                <Smartphone className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div><p className="text-sm font-bold text-amber-900">{t("topUp")}</p><p className="text-xs text-amber-800/80 font-medium leading-relaxed">{t("topUpDesc")}</p></div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">{t("receiveEmail")}</label>
                            <Input icon={Mail} type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={cn("bg-white border-slate-200 text-slate-900 shadow-sm focus:border-blue-500", email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "border-red-300 focus:border-red-500 bg-red-50" : "")} readOnly={!!user?.email} />
                            {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (<p className="text-xs text-red-500 ml-1 flex items-center gap-1 font-medium">{t("invalidEmail")}</p>) : (<p className="text-xs text-slate-400 ml-1 flex items-center gap-1"><Shield className="w-3 h-3" />{t("emailNote")}</p>)}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2 ml-1"><CreditCard className="h-4 w-4 text-slate-400" /><h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t("paymentMethod")}</h3></div>
                            <div onClick={() => setPaymentMethod("qpay")} className={cn("flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all shadow-sm", paymentMethod === "qpay" ? "bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500" : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50")}>
                                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">Q</div><div><div className="font-bold text-slate-900">QPay</div><div className="text-xs text-slate-500">{t("qpayDesc")}</div></div></div>
                                {paymentMethod === "qpay" && <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl border transition-all shadow-sm opacity-60 cursor-not-allowed bg-slate-50 border-slate-100"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center"><CreditCard className="w-5 h-5 text-slate-500" /></div><div><div className="font-bold text-slate-500 flex items-center gap-2">Stripe / Card<span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">{t("comingSoon")}</span></div><div className="text-xs text-slate-400">{t("internationalCard")}</div></div></div></div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <Button size="lg" fullWidth className="bg-blue-600 hover:bg-blue-700 text-white py-8 rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all" onClick={createQPayInvoice} disabled={!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || isLoading}>{isLoading ? (<Loader2 className="h-6 w-6 animate-spin" />) : (<>{t("payNow")}<ChevronRight className="h-5 w-5 ml-2" /></>)}</Button>
                            <div className="flex items-center justify-center gap-2 mt-4 text-slate-400"><Shield className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-widest">{t("securePayment")}</span></div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
