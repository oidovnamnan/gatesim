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
    Compass
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc, writeBatch, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import defaultStaff from "@/lib/data/ai-staff-defaults.json";

interface AIStaff {
    id: string;
    name: string;
    image: string;
    roles: string[]; // 'sales', 'travel'
    isActive: boolean;
    isDefaultSales: boolean;
    isDefaultTravel: boolean;
    createdAt?: number;
}

export default function AIStaffPage() {
    const [staff, setStaff] = useState<AIStaff[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "sales" | "travel">("all");

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
        if (!confirm("Бүх ажилтны мэдээллийг анхны (Default) байдалд оруулж шинэчлэх үү?")) return;

        setIsSaving(true);
        try {
            const batch = writeBatch(db);

            // Delete existing
            staff.forEach(s => {
                batch.delete(doc(db, "aiStaff", s.id));
            });

            // Add defaults
            defaultStaff.forEach(s => {
                batch.set(doc(db, "aiStaff", s.id), {
                    ...s,
                    createdAt: Date.now()
                });
            });

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

    const setAsDefault = async (person: AIStaff, type: 'sales' | 'travel') => {
        const batch = writeBatch(db);

        // Unset others
        staff.forEach(s => {
            if (type === 'sales' && s.isDefaultSales) {
                batch.update(doc(db, "aiStaff", s.id), { isDefaultSales: false });
            }
            if (type === 'travel' && s.isDefaultTravel) {
                batch.update(doc(db, "aiStaff", s.id), { isDefaultTravel: false });
            }
        });

        // Set this one
        batch.update(doc(db, "aiStaff", person.id), {
            [type === 'sales' ? 'isDefaultSales' : 'isDefaultTravel']: true,
            isActive: true // Must be active to be default
        });

        try {
            await batch.commit();
        } catch (error) {
            console.error("Error setting default:", error);
        }
    };

    const filteredStaff = staff.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "all" || s.roles.includes(activeTab);
        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-500" />
                        AI Ажилчдын удирдлага
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Чат бот болон AI Hub-д ажиллах бүсгүйчүүдийг тохируулах.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleLoadDefaults}
                        disabled={isSaving}
                        className="bg-white dark:bg-slate-800"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Defaults ачаалах
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Шинэ ажилтан нэмэх
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Нэрээр хайх..."
                        className="pl-10 bg-white dark:bg-slate-800"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {(['all', 'sales', 'travel'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                                activeTab === tab
                                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            {tab === 'all' ? 'Бүгд' : tab === 'sales' ? 'Симний мэргэжилтэн' : 'AI Hub / Аяллын хөтөч'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-slate-500">Уншиж байна...</p>
                </div>
            ) : filteredStaff.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 italic">Ажилтан олдсонгүй.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStaff.map((person) => (
                        <Card
                            key={person.id}
                            className={cn(
                                "overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group transition-all hover:shadow-xl",
                                !person.isActive && "opacity-60 grayscale-[0.5]"
                            )}
                        >
                            <div className="relative aspect-square">
                                <Image
                                    src={person.image}
                                    alt={person.name}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <div className="flex gap-2 mb-2">
                                        <Button
                                            size="sm"
                                            variant={person.isDefaultSales ? "default" : "secondary"}
                                            className={person.isDefaultSales ? "bg-red-600" : ""}
                                            onClick={() => setAsDefault(person, 'sales')}
                                        >
                                            <Monitor className="h-4 w-4 mr-1" />
                                            Home Active
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={person.isDefaultTravel ? "default" : "secondary"}
                                            className={person.isDefaultTravel ? "bg-blue-600" : ""}
                                            onClick={() => setAsDefault(person, 'travel')}
                                        >
                                            <Compass className="h-4 w-4 mr-1" />
                                            Hub Active
                                        </Button>
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 flex flex-col gap-2">
                                    {person.isDefaultSales && (
                                        <Badge className="bg-red-500 text-white border-none shadow-lg">Home Active</Badge>
                                    )}
                                    {person.isDefaultTravel && (
                                        <Badge className="bg-blue-500 text-white border-none shadow-lg">Hub Active</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-800">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{person.name}</h3>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={person.isActive}
                                            onChange={() => toggleActive(person)}
                                        />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                                    </label>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <button
                                        onClick={() => toggleRole(person, 'sales')}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border",
                                            person.roles.includes('sales')
                                                ? "bg-red-50 text-red-600 border-red-200"
                                                : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                                        )}
                                    >
                                        <Briefcase className="h-3 w-3" />
                                        Симний мэргэжилтэн
                                        {person.roles.includes('sales') && <Check className="h-3 w-3" />}
                                    </button>
                                    <button
                                        onClick={() => toggleRole(person, 'travel')}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border",
                                            person.roles.includes('travel')
                                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                                : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                                        )}
                                    >
                                        <MapPin className="h-3 w-3" />
                                        AI Hub / Аяллын хөтөч
                                        {person.roles.includes('travel') && <Check className="h-3 w-3" />}
                                    </button>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-500">
                                        Засах
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
