"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAdminRole, canAccess } from "@/config/admin";
import {
    Download,
    Trash2,
    Calendar,
    Sparkles,
    Image as ImageIcon,
    Loader2,
    ChevronLeft
} from "lucide-react";
import Link from "next/link";

interface HubPoster {
    id: string;
    imageUrl: string;
    captionMN: string;
    captionEN: string;
    hashtags: string[];
    provider: string;
    idea: string;
    prompt: string;
    createdAt: any;
}

export default function AIHubGalleryPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [posters, setPosters] = useState<HubPoster[]>([]);
    const [loading, setLoading] = useState(true);

    // Access Control
    useEffect(() => {
        if (status === 'loading') return;
        const role = getAdminRole(session?.user?.email);
        if (!canAccess(role, 'ai')) {
            router.push('/admin');
        } else {
            fetchPosters();
        }
    }, [session, status]);

    const fetchPosters = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/poster/hub/list');
            const data = await res.json();
            if (data.posters) {
                setPosters(data.posters);
            }
        } catch (error) {
            console.error("Failed to fetch posters:", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = async (url: string, name: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/admin/content">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            AI Hub Gallery
                            <Sparkles className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Хадгалсан постеруудын сан</p>
                    </div>
                </div>
            </div>

            {posters.length === 0 ? (
                <Card className="p-20 text-center border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/20">
                    <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-400">Одоогоор хадгалсан зураг алга</h3>
                    <p className="text-slate-400 text-sm mt-1">Content Studio-с зураг үүсгээд ЭНД хадгалаарай.</p>
                    <Link href="/admin/content" className="mt-6 inline-block">
                        <Button className="bg-blue-600 hover:bg-blue-700">Content Studio руу очих</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {posters.map((p) => (
                        <Card key={p.id} className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="aspect-[4/5] relative bg-slate-100 dark:bg-slate-950">
                                <img
                                    src={p.imageUrl}
                                    className="w-full h-full object-cover"
                                    alt={p.idea}
                                />
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="w-8 h-8 rounded-full bg-white/90 shadow-md"
                                        onClick={() => downloadImage(p.imageUrl, `poster_${p.id}`)}
                                    >
                                        <Download className="w-4 h-4 text-slate-700" />
                                    </Button>
                                </div>
                                <div className="absolute top-2 left-2">
                                    <span className="px-2 py-0.5 rounded-full bg-black/50 text-[10px] text-white backdrop-blur-sm font-bold uppercase tracking-widest">
                                        {p.provider}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter mb-1">
                                        <Calendar className="w-3 h-3" />
                                        {p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : 'Саяхан'}
                                    </p>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                                        {p.idea || "Untitled AI Creation"}
                                    </h4>
                                </div>

                                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] text-slate-500 italic mb-1">MN Caption:</p>
                                    <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-3">
                                        {p.captionMN}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {p.hashtags?.slice(0, 3).map((tag, idx) => (
                                        <span key={idx} className="text-[10px] text-blue-500 font-bold">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
