"use client";

import { useState, useEffect } from "react";
import { ThemeSelector } from "@/components/admin/settings/theme-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Save, AlertCircle, RefreshCw, Globe, Shield, Palette, Check, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { subscribeToSystemConfig, updateSystemConfig } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";

interface PricingSettings {
    usdToMnt: number;
    marginPercent: number;
    maintenanceMode?: boolean;
}

export default function SettingsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<PricingSettings>({ usdToMnt: 3450, marginPercent: 25, maintenanceMode: false });
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToSystemConfig((config) => {
            // Merge default metrics if new keys missing
            setSettings(prev => ({
                ...prev,
                ...config,
                usdToMnt: config.usdToMnt || 3450,
                marginPercent: config.marginPercent || 25,
                maintenanceMode: config.maintenanceMode || false
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
        <div className="space-y-8 max-w-4xl pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Тохиргоо</h1>
                    <p className="text-white/60">Системийн үндсэн тохиргоо болон үнийн бодлого (Real-time synced)</p>
                </div>
            </div>

            {/* 0. Appearance - Design Theme */}
            <Card className="p-6 border-white/10 bg-white/5 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                        <Palette className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Харагдах Байдал (Design Theme)</h2>
                        <p className="text-sm text-white/50">Системийн үндсэн өнгийг эндээс солино (Real-time)</p>
                    </div>
                </div>

                <ThemeSelector />
            </Card>

            {/* 1. Pricing Strategy - Үнийн бодлого */}
            <Card className="p-6 border-white/10 bg-white/5 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                        <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Үнийн Бодлого (Pricing Rules)</h2>
                        <p className="text-sm text-white/50">Энд өөрчилсөн тохиргоо бүх багцын үнэд шууд нөлөөлнө</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label className="text-white">USD Ханш (₮)</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={settings.usdToMnt}
                                onChange={(e) => setSettings(s => ({ ...s, usdToMnt: Number(e.target.value) }))}
                                className="bg-black/20 border-white/10 text-white pr-12 font-mono text-lg"
                            />
                            <div className="absolute right-3 top-3 text-xs text-white/40">MNT</div>
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed">
                            MobiMatter-аас ирж буй USD үнийг MNT руу хөрвүүлэхэд ашиглана.
                            <br />
                            <span className="text-yellow-400/80">Жишээ: $10 * {settings.usdToMnt} = ₮{(10 * settings.usdToMnt).toLocaleString()}</span>
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-white">Ашгийн Маржин (%)</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={settings.marginPercent}
                                onChange={(e) => setSettings(s => ({ ...s, marginPercent: Number(e.target.value) }))}
                                className="bg-black/20 border-white/10 text-white pr-12 font-mono text-lg"
                            />
                            <div className="absolute right-3 top-3 text-xs text-white/40">%</div>
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed">
                            Үндсэн өртөг дээр нэмэгдэх ашиг.
                            <br />
                            <span className="text-primary font-bold">
                                Жишээ: $10 * {settings.usdToMnt} * {(1 + settings.marginPercent / 100).toFixed(2)} = ₮{Math.ceil((10 * settings.usdToMnt * (1 + settings.marginPercent / 100)) / 100) * 100}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleSave}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
            <Card className="p-6 border-white/10 bg-white/5 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">API Холболтууд</h2>
                        <p className="text-sm text-white/50">Гадаад системүүдтэй хийх холболтын тохиргоо</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* MobiMatter */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-white">MobiMatter API</span>
                                <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Connected</Badge>
                            </div>
                            <span className="text-xs text-white/40">Last sync: 10 mins ago</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                            <div className="space-y-2">
                                <Label className="text-xs text-white/60">API Key</Label>
                                <Input type="password" value="************************" disabled className="bg-transparent border-white/10 text-white/50 h-8 text-xs font-mono" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-white/60">Merchant ID</Label>
                                <Input value="7af9****-****-****-****-********2b1a" disabled className="bg-transparent border-white/10 text-white/50 h-8 text-xs font-mono" />
                            </div>
                        </div>
                    </div>

                    {/* QPay */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-white">QPay Payment</span>
                                <Badge variant="warning" className="text-yellow-400 border-yellow-400/20 bg-yellow-400/5">Sandbox Mode</Badge>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                            <div className="space-y-2">
                                <Label className="text-xs text-white/60">Username</Label>
                                <Input value="GATE_SIM_TEST" disabled className="bg-transparent border-white/10 text-white/50 h-8 text-xs font-mono" />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 3. System */}
            <Card className="p-6 border-white/10 bg-white/5 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Систем</h2>
                        <p className="text-sm text-white/50">Аюулгүй байдал болон бусад</p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                        <h3 className="font-medium text-white">Maintenance Mode</h3>
                        <p className="text-xs text-white/50">Вэбсайтыг түр хааж, засварын хуудас харуулах</p>
                    </div>
                    <Button
                        variant={settings.maintenanceMode ? "danger" : "outline"}
                        className={settings.maintenanceMode ? "bg-red-500 hover:bg-red-600 text-white" : "text-white border-white/10 hover:bg-white/10"}
                        onClick={toggleMaintenance}
                    >
                        <Power className="w-4 h-4 mr-2" />
                        {settings.maintenanceMode ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}
                    </Button>
                </div>
            </Card>

            <div className="flex items-center gap-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Таны хийсэн өөрчлөлтүүд шууд хадгалагдах бөгөөд хэрэглэгчдэд шууд харагдана.</span>
            </div>
        </div>
    )
}
