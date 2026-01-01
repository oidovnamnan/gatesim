"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Bot,
    Save,
    RefreshCcw,
    Database,
    Cpu
} from "lucide-react";

export default function AIControlPage() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">AI Control Center</h1>
                    <p className="text-slate-400">AI туслахын тохиргоо болон хяналт</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Өөрчлөлтийг хадгалах
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-slate-900/50 border-slate-800 p-6 space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                            <Bot className="w-5 h-5 text-blue-400" />
                            <h3 className="font-bold text-white">System Personality</h3>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">System Prompt</Label>
                            <Textarea
                                className="bg-slate-950 border-slate-800 text-slate-300 min-h-[200px] font-mono text-sm leading-relaxed focus:ring-blue-500"
                                defaultValue={`You are GateSIM AI, a helpful travel assistant.
You strictly answer in Mongolian language (Cyrillic).
You provide helpful, concise, and friendly responses about travel, eSIMs, and connectivity.
Use emojis to make the conversation engaging.
IMPORTANT: Use the provided context data to answer accurately.`}
                            />
                            <p className="text-xs text-slate-500">
                                Энэхүү заавар нь AI хэрхэн ажиллах, ямар өнгө аясаар хариулахыг тодорхойлно.
                            </p>
                        </div>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-800 p-6 space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                            <Database className="w-5 h-5 text-emerald-400" />
                            <h3 className="font-bold text-white">Knowledge Base (RAG)</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                                <span className="text-slate-500 text-xs uppercase font-bold">Loaded Countries</span>
                                <p className="text-2xl font-bold text-white mt-1">245</p>
                            </div>
                            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                                <span className="text-slate-500 text-xs uppercase font-bold">Total Vectors</span>
                                <p className="text-2xl font-bold text-white mt-1">12,500</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Re-index Database
                        </Button>
                    </Card>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <Card className="bg-slate-900/50 border-slate-800 p-6 space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                            <Cpu className="w-5 h-5 text-amber-400" />
                            <h3 className="font-bold text-white">Model Config</h3>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Model</Label>
                            <select className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                <option>gpt-4o-mini</option>
                                <option>gpt-4o</option>
                                <option>gpt-3.5-turbo</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Temperature (Creativity)</Label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    defaultValue="0.7"
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <span className="text-sm font-mono text-slate-400 w-8">0.7</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Max Tokens</Label>
                            <Input
                                type="number"
                                defaultValue={500}
                                className="bg-slate-950 border-slate-800 text-white focus-visible:ring-blue-500"
                            />
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/20 p-6">
                        <h4 className="font-bold text-blue-400 mb-2">Usage Cost (Estimated)</h4>
                        <div className="flex items-end gap-2 mb-1">
                            <span className="text-3xl font-bold text-white">$4.52</span>
                            <span className="text-sm text-slate-400 mb-1">this month</span>
                        </div>
                        <p className="text-xs text-slate-500">Based on GPT-4o-mini pricing ($0.15/1M tokens)</p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
