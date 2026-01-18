"use client";

import { useState, useEffect } from "react";
import { ThemeSelector } from "@/components/admin/settings/theme-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Save, AlertCircle, RefreshCw, Globe, Shield, Palette, Check, Power, ImagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { subscribeToSystemConfig, updateSystemConfig } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAdminRole, canAccess } from "@/config/admin";

interface PricingSettings {
    usdToMnt: number;
    marginPercent: number;
    maintenanceMode?: boolean;
    openaiApiKey?: string;
    googleApiKey?: string;
    preferredImageAI?: 'openai' | 'google';
}

export default function SettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [settings, setSettings] = useState<PricingSettings>({
        usdToMnt: 3450,
        marginPercent: 25,
        maintenanceMode: false,
        openaiApiKey: '',
        googleApiKey: '',
        preferredImageAI: 'openai'
    });
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    // Access Control
    useEffect(() => {
        if (status === 'loading') return;

        const role = getAdminRole(session?.user?.email);
        if (!canAccess(role, 'settings')) {
            router.push('/admin');
        }
    }, [session, status, router]);

    // Show nothing while checking access (optional)
    const role = getAdminRole(session?.user?.email);
    if (status !== 'loading' && !canAccess(role, 'settings')) {
        return null;
    }

    useEffect(() => {
        const unsubscribe = subscribeToSystemConfig((config) => {
            // Merge default metrics if new keys missing
            setSettings(prev => ({
                ...prev,
                ...config,
                usdToMnt: config.usdToMnt || 3450,
                marginPercent: config.marginPercent || 25,
                maintenanceMode: config.maintenanceMode || false,
                openaiApiKey: config.openaiApiKey || '',
                googleApiKey: config.googleApiKey || '',
                preferredImageAI: config.preferredImageAI || 'openai'
            }));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        try {
            await updateSystemConfig(settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            toast({ title: "Settings Saved", description: "Pricing and System updates applied." });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
        }
    };

    const toggleMaintenance = async () => {
        const newState = !settings.maintenanceMode;
        try {
            await updateSystemConfig({ ...settings, maintenanceMode: newState });
            toast({
                title: newState ? "Maintenance Mode ON" : "Maintenance Mode OFF",
                description: newState ? "Site is now restricted." : "Site is live."
            });
        } catch (e) {
            toast({ title: "Error", variant: "destructive", description: "Failed to toggle maintenance mode." });
        }
    };

    return (
        <div className="space-y-8 max-w-4xl pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Тохиргоо</h1>
                    <p className="text-slate-500 dark:text-slate-400">Системийн үндсэн тохиргоо болон үнийн бодлого (Real-time synced)</p>
                </div>
            </div>

            {/* 0. Appearance - Design Theme */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        <Palette className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Харагдах Байдал (Design Theme)</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Системийн үндсэн өнгийг эндээс солино (Real-time)</p>
                    </div>
                </div>

                <ThemeSelector />
            </Card>

            {/* 1. Pricing Strategy - Үнийн бодлого */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                        <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Үнийн Бодлого (Pricing Rules)</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Энд өөрчилсөн тохиргоо бүх багцын үнэд шууд нөлөөлнө</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label className="text-slate-700 dark:text-slate-300">USD Ханш (₮)</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={settings.usdToMnt}
                                onChange={(e) => setSettings(s => ({ ...s, usdToMnt: Number(e.target.value) }))}
                                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pr-12 font-mono text-lg"
                            />
                            <div className="absolute right-3 top-3 text-xs text-slate-400">MNT</div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            MobiMatter-аас ирж буй USD үнийг MNT руу хөрвүүлэхэд ашиглана.
                            <br />
                            <span className="text-amber-600 dark:text-amber-400/80">Жишээ: $10 * {settings.usdToMnt} = ₮{(10 * settings.usdToMnt).toLocaleString()}</span>
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-slate-700 dark:text-slate-300">Ашгийн Маржин (%)</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={settings.marginPercent}
                                onChange={(e) => setSettings(s => ({ ...s, marginPercent: Number(e.target.value) }))}
                                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pr-12 font-mono text-lg"
                            />
                            <div className="absolute right-3 top-3 text-xs text-slate-400">%</div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Үндсэн өртөг дээр нэмэгдэх ашиг.
                            <br />
                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                                Жишээ: $10 * {settings.usdToMnt} * {(1 + settings.marginPercent / 100).toFixed(2)} = ₮{Math.ceil((10 * settings.usdToMnt * (1 + settings.marginPercent / 100)) / 100) * 100}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {saved ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Хадгалагдлаа!
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Үнийн бодлогыг хадгалах
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            {/* 2. API Integrations */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">API Холболтууд</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Гадаад системүүдтэй хийх холболтын тохиргоо</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* MobiMatter */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900 dark:text-white">MobiMatter API</span>
                                <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">Connected</Badge>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-500">Last sync: 10 mins ago</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-500 dark:text-white/60">API Key</Label>
                                <Input type="password" value="************************" disabled className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 h-8 text-xs font-mono" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-500 dark:text-white/60">Merchant ID</Label>
                                <Input value="7af9****-****-****-****-********2b1a" disabled className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 h-8 text-xs font-mono" />
                            </div>
                        </div>
                    </div>

                    {/* QPay */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900 dark:text-white">QPay Payment</span>
                                <Badge variant="secondary" className="text-amber-600 dark:text-amber-400 border-amber-400/20 bg-amber-400/10 hover:bg-amber-400/20">Sandbox Mode</Badge>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-500 dark:text-white/60">Username</Label>
                                <Input value="GATE_SIM_TEST" disabled className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 h-8 text-xs font-mono" />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 3. AI Image Generation */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400">
                        <ImagePlus className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">AI Зураг Үүсгэх</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Постер үүсгэхэд ашиглах AI API тохиргоо</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Preferred AI Selection */}
                    <div className="space-y-3">
                        <Label className="text-slate-700 dark:text-slate-300">Ашиглах AI сонгох</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSettings(s => ({ ...s, preferredImageAI: 'openai' }))}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${settings.preferredImageAI === 'openai'
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <div className="font-medium text-slate-900 dark:text-white">OpenAI DALL-E</div>
                                <div className="text-xs text-slate-500 mt-1">$0.04/зураг • Түргэн</div>
                            </button>
                            <button
                                onClick={() => setSettings(s => ({ ...s, preferredImageAI: 'google' }))}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${settings.preferredImageAI === 'google'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <div className="font-medium text-slate-900 dark:text-white">Google Imagen</div>
                                <div className="text-xs text-slate-500 mt-1">$0.02/зураг • Өндөр чанар</div>
                            </button>
                        </div>
                    </div>

                    {/* OpenAI API Key */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900 dark:text-white">OpenAI API</span>
                                {settings.openaiApiKey ? (
                                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Тохируулсан</Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-slate-500 dark:text-slate-400">Тохируулаагүй</Badge>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-500 dark:text-white/60">API Key (sk-...)</Label>
                                <Input
                                    type="password"
                                    value={settings.openaiApiKey || ''}
                                    onChange={(e) => setSettings(s => ({ ...s, openaiApiKey: e.target.value }))}
                                    placeholder="sk-proj-..."
                                    className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-10 text-sm font-mono"
                                />
                                <p className="text-xs text-slate-400">platform.openai.com → API Keys хэсгээс авна</p>
                            </div>
                        </div>
                    </div>

                    {/* Google Imagen API Key */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900 dark:text-white">Google Imagen API</span>
                                {settings.googleApiKey ? (
                                    <Badge variant="default" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">Тохируулсан</Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-slate-500 dark:text-slate-400">Тохируулаагүй</Badge>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-500 dark:text-white/60">API Key</Label>
                                <Input
                                    type="password"
                                    value={settings.googleApiKey || ''}
                                    onChange={(e) => setSettings(s => ({ ...s, googleApiKey: e.target.value }))}
                                    placeholder="AIza..."
                                    className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-10 text-sm font-mono"
                                />
                                <p className="text-xs text-slate-400">Google Cloud Console → Vertex AI → API Keys</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleSave}
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                    >
                        {saved ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Хадгалагдлаа!
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                AI тохиргоо хадгалах
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            {/* 4. System */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Систем</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Аюулгүй байдал болон бусад</p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">Maintenance Mode</h3>
                        <p className="text-xs text-slate-500 dark:text-white/50">Вэбсайтыг түр хааж, засварын хуудас харуулах</p>
                    </div>
                    <Button
                        variant={settings.maintenanceMode ? "destructive" : "outline"}
                        className={settings.maintenanceMode ? "bg-red-600 hover:bg-red-700 text-white" : "text-slate-700 dark:text-white border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"}
                        onClick={toggleMaintenance}
                    >
                        <Power className="w-4 h-4 mr-2" />
                        {settings.maintenanceMode ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}
                    </Button>
                </div>
            </Card>

            <div className="flex items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-300 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Таны хийсэн өөрчлөлтүүд шууд хадгалагдах бөгөөд хэрэглэгчдэд шууд харагдана.</span>
            </div>
        </div>
    )
}
