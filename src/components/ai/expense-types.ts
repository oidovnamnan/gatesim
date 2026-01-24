export interface Expense {
    id: string;
    merchant: string;
    date: string;
    amount: number;
    currency: string;
    category: string;
    imageUrl?: string;
    timestamp: number;
}

export interface CustomCategory {
    id: string;
    name: string;
    emoji: string;
    color: string;
}
