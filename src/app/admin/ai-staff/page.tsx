"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Plus,
    Search,
    Check,
    X,
    Briefcase,
    MapPin,
    Heart,
    Trash2,
    RotateCcw,
    Loader2,
    Monitor,
    Compass,
    Sparkles,
    ShieldCheck,
    ToggleLeft,
    ToggleRight
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import defaultStaff from "@/lib/data/ai-staff-defaults.json";
import { motion, AnimatePresence } from "framer-motion";

interface AIStaff {
    id: string;
    name: string;
    image: string;
    roles: string[]; // 'sales', 'travel', 'manager'
    isActive: boolean;
    isDefaultSales: boolean;
    isDefaultTravel: boolean;
    isDefaultManager: boolean;
    createdAt?: number;
}

export default function AIStaffPage() {
    const [staff, setStaff] = useState<AIStaff[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "sales" | "travel" | "manager">("all");

    useEffect(() => {
        const q = query(collection(db, "aiStaff"), orderBy("id", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const staffData = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as AIStaff[];
            setStaff(staffData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLoadDefaults = async () => {
        setIsSaving(true);
        try {
            const batch = writeBatch(db);

            // Add defaults using setDoc to ensure IDs match
            for (const s of defaultStaff) {
                const staffRef = doc(db, "aiStaff", s.id);
                batch.set(staffRef, {
                    ...s,
                    isDefaultManager: false, // Ensure new field exists
                    createdAt: Date.now()
                }, { merge: true });
            }

            await batch.commit();
        } catch (error) {
            console.error("Error loading defaults:", error);
            alert("Алдаа гарлаа.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleRole = async (person: AIStaff, role: string) => {
        const newRoles = person.roles.includes(role)
            ? person.roles.filter(r => r !== role)
            : [...person.roles, role];

        try {
            await updateDoc(doc(db, "aiStaff", person.id), { roles: newRoles });
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    const toggleActive = async (person: AIStaff) => {
        try {
            await updateDoc(doc(db, "aiStaff", person.id), { isActive: !person.isActive });
        } catch (error) {
            console.error("Error toggling active:", error);
        }
    };

    const setAsDefault = async (person: AIStaff, type: 'sales' | 'travel' | 'manager') => {
        const batch = writeBatch(db);

        // Unset others
        staff.forEach(s => {
            if (type === 'sales' && s.isDefaultSales) {
                batch.update(doc(db, "aiStaff", s.id), { isDefaultSales: false });
            }
            if (type === 'travel' && s.isDefaultTravel) {
                batch.update(doc(db, "aiStaff", s.id), { isDefaultTravel: false });
            }
            if (type === 'manager' && s.isDefaultManager) {
                batch.update(doc(db, "aiStaff", s.id), { isDefaultManager: false });
            }
        });

        // Set this one
        batch.update(doc(db, "aiStaff", person.id), {
            [type === 'sales' ? 'isDefaultSales' : type === 'travel' ? 'isDefaultTravel' : 'isDefaultManager']: true,
            isActive: true // Must be active to be default
        });

        try {
            await batch.commit();
        } catch (error) {
            console.error("Error setting default:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Энэ ажилтныг устгах үү?")) return;
        try {
            await updateDoc(doc(db, "aiStaff", id), { isActive: false });
        } catch (error) {
            console.error("Error deactivating:", error);
        }
    };

    const filteredStaff = staff.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "all" || s.roles.includes(activeTab);
        return matchesSearch && matchesTab;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 p-10 md:p-16 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/20 shadow-xl">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md px-4 py-1.5 rounded-full font-black tracking-widest text-[10px]">
                                <Sparkles className="h-3.5 w-3.5 mr-2 text-yellow-300 animate-pulse" />
                                DIGITAL OFFICE
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                            AI Ажилчдын <br /> <span className="text-blue-200">удирдлага</span>
                        </h1>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="secondary"
                            onClick={handleLoadDefaults}
                            disabled={isSaving}
                            className="bg-white text-blue-700 hover:bg-blue-50 border-none shadow-xl h-14 px-8 rounded-2xl font-black transition-all hover:scale-105"
                        >
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <RotateCcw className="h-5 w-5 mr-3" />}
                            Ажилчдыг ачаалах
                        </Button>
                        <Button className="bg-indigo-500/20 hover:bg-indigo-500/40 text-white border border-white/20 backdrop-blur-xl shadow-xl h-14 px-8 rounded-2xl font-black transition-all hover:scale-105">
                            <Plus className="h-5 w-5 mr-3" />
                            Шинэ дүр нэмэх
                        </Button>
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl">
                <div className="lg:col-span-5 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                        placeholder="Ажилтны нэрээр хайх..."
                        className="pl-14 h-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold text-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="lg:col-span-7">
                    <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto no-scrollbar">
                        {(['all', 'sales', 'travel', 'manager'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "flex-1 min-w-[140px] px-6 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                                    activeTab === tab
                                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-lg"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {tab === 'all' ? 'Бүх ажилчид' : tab === 'sales' ? 'Симний мэргэжилтэн' : tab === 'travel' ? 'AI Hub / Аяллын хөтөч' : 'Оффис менежер'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-200 dark:border-slate-800">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                    <p className="mt-8 text-slate-500 font-black tracking-[0.2em] uppercase text-[10px]">Мэдээлэл уншиж байна...</p>
                </div>
            ) : filteredStaff.length === 0 ? (
                <div className="text-center py-32 bg-white dark:bg-slate-900/50 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-8" />
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Ажилтан олдсонгүй</h3>
                    <Button onClick={handleLoadDefaults} className="bg-blue-600 mt-6 rounded-2xl h-16 px-12 font-black text-lg">Захирал аа, эхлүүлцгээе!</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    <AnimatePresence mode="popLayout">
                        {filteredStaff.map((person, index) => (
                            <motion.div
                                key={person.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                            >
                                <Card className={cn("group overflow-hidden bg-white dark:bg-slate-900 border-none shadow-xl rounded-[3rem] flex flex-col h-full ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-blue-500/30", !person.isActive && "opacity-60 grayscale-[0.8]")}>
                                    <div className="relative aspect-[3.5/4.5] overflow-hidden">
                                        <Image src={person.image} alt={person.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent opacity-80" />

                                        <div className="absolute inset-0 flex flex-col justify-end p-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                            <div className="space-y-3">
                                                <button onClick={() => setAsDefault(person, 'sales')} className={cn("w-full h-10 rounded-2xl font-black text-[10px] uppercase tracking-widest backdrop-blur-xl transition-all flex items-center justify-center gap-3", person.isDefaultSales ? "bg-red-500 text-white shadow-xl" : "bg-white/20 text-white")}>
                                                    <Monitor className="h-4 w-4" /> Home Advisor
                                                </button>
                                                <button onClick={() => setAsDefault(person, 'travel')} className={cn("w-full h-10 rounded-2xl font-black text-[10px] uppercase tracking-widest backdrop-blur-xl transition-all flex items-center justify-center gap-3", person.isDefaultTravel ? "bg-blue-500 text-white shadow-xl" : "bg-white/20 text-white")}>
                                                    <Compass className="h-4 w-4" /> Hub Specialist
                                                </button>
                                                <button onClick={() => setAsDefault(person, 'manager')} className={cn("w-full h-10 rounded-2xl font-black text-[10px] uppercase tracking-widest backdrop-blur-xl transition-all flex items-center justify-center gap-3", person.isDefaultManager ? "bg-emerald-500 text-white shadow-xl" : "bg-white/20 text-white")}>
                                                    <ShieldCheck className="h-4 w-4" /> Office Manager
                                                </button>
                                            </div>
                                        </div>

                                        <div className="absolute top-4 right-4 flex flex-col gap-1 scale-75 origin-top-right">
                                            {person.isDefaultSales && <Badge className="bg-red-500 text-white border-none">HOME SALES</Badge>}
                                            {person.isDefaultTravel && <Badge className="bg-blue-500 text-white border-none">HUB GUIDE</Badge>}
                                            {person.isDefaultManager && <Badge className="bg-emerald-500 text-white border-none">MANAGER</Badge>}
                                        </div>

                                        <div className="absolute bottom-6 left-8 right-8 group-hover:opacity-0 transition-opacity">
                                            <h3 className="text-2xl font-black text-white leading-none mb-1 tracking-tighter">{person.name}</h3>
                                            <p className="text-[10px] text-blue-200 font-extrabold uppercase tracking-[0.2em]">GateSIM Expert</p>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className={cn("w-3 h-3 rounded-full", person.isActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
                                            <button onClick={() => toggleActive(person)} className={cn("h-7 w-12 rounded-full p-1 transition-all flex items-center", person.isActive ? "bg-emerald-500 justify-end" : "bg-slate-200 justify-start")}>
                                                <div className="h-5 w-5 bg-white rounded-full shadow-md" />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                <button onClick={() => toggleRole(person, 'sales')} className={cn("flex-1 px-4 py-3 rounded-xl text-[10px] font-black border-2", person.roles.includes('sales') ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-400 border-slate-50")}>
                                                    SALES {person.roles.includes('sales') && <Check className="h-3 w-3 inline ml-1" />}
                                                </button>
                                                <button onClick={() => toggleRole(person, 'travel')} className={cn("flex-1 px-4 py-3 rounded-xl text-[10px] font-black border-2", person.roles.includes('travel') ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-slate-50 text-slate-400 border-slate-50")}>
                                                    TRAVEL {person.roles.includes('travel') && <Check className="h-3 w-3 inline ml-1" />}
                                                </button>
                                                <button onClick={() => toggleRole(person, 'manager')} className={cn("flex-1 px-4 py-3 rounded-xl text-[10px] font-black border-2", person.roles.includes('manager') ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-50")}>
                                                    MANAGER {person.roles.includes('manager') && <Check className="h-3 w-3 inline ml-1" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <Badge variant="outline" className="text-[9px] font-black text-slate-400 border-slate-200">ID: {person.id.toUpperCase()}</Badge>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(person.id)} className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-blue-500 bg-blue-50 rounded-2xl">
                                                    <ShieldCheck className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
