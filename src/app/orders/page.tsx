"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/my-esims");
    }, [router]);

    return null;
}
