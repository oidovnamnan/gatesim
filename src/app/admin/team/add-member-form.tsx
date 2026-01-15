"use client";

import { useFormStatus } from "react-dom";
import { addTeamMember } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useRef } from "react";
import { Loader2, Plus } from "lucide-react";

// Correct import for useFormState in newer Next.js or use manual submission
// For simplicity and compatibility, I'll use a wrapper

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
            {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Nэмэх
        </Button>
    )
}

export function AddMemberForm() {
    const { toast } = useToast();
    const ref = useRef<HTMLFormElement>(null);

    // Using simple onSubmit for better control if verify types issues
    async function handleSubmit(formData: FormData) {
        const result = await addTeamMember(null, formData);
        if (result.success) {
            toast({ title: "Амжилттай", description: "Шинэ гишүүн нэмэгдлээ" });
            ref.current?.reset();
        } else {
            toast({ title: "Алдаа", description: result.message, variant: "destructive" });
        }
    }

    return (
        <form action={handleSubmit} ref={ref} className="flex flex-col md:flex-row gap-4 items-end bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <div className="space-y-2 flex-1 w-full">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Имэйл хаяг</label>
                <Input
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
            </div>
            <div className="space-y-2 w-full md:w-[200px]">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Эрх (Role)</label>
                <Select name="role" defaultValue="STAFF" required>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                        <SelectItem value="STAFF">Staff (Ажилтан)</SelectItem>
                        <SelectItem value="ADMIN">Admin (Админ)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <SubmitButton />
        </form>
    );
}
