export interface Expense {
    id: string;
    merchant: string;
    date: string;
    amount: number;
    currency: string;
    category: "Food" | "Transport" | "Shopping" | "Entertainment" | "Medical" | "Other";
    imageUrl?: string;
    timestamp: number;
}
