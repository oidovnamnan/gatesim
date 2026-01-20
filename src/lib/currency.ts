
/**
 * Currency Utility for GateSIM
 * Handles exchange rates and formatting for Mongolian travelers
 */

export interface ExchangeRates {
    MNT: number; // USD to MNT
    CNY: number; // USD to CNY
    KRW: number; // USD to KRW
    JPY: number; // USD to JPY
    THB: number; // USD to THB
    EUR: number; // USD to EUR
}

// Verified rates for Jan 20, 2026 (Extracted directly from khanbank.com)
const VERIFIED_RATES: ExchangeRates = {
    MNT: 3580, // Khan Bank Sell Rate (Cash)
    CNY: 7.23,
    KRW: 1380,
    JPY: 154,
    THB: 35.5,
    EUR: 0.94
};

// Internal reference for different rate types if needed
export const KHAN_BANK_LIVE = {
    date: '2026-01-20',
    usd: {
        sell_cash: 3580.00,
        sell_non_cash: 3562.00,
        official: 3561.49
    }
};

/**
 * Fetches current exchange rates from Mongol Bank (Central Bank of Mongolia)
 * Uses the community-standard monxansh feed for live data
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
    try {
        const response = await fetch('http://monxansh.appspot.com/xansh.json');
        if (!response.ok) throw new Error("Failed to fetch rates");

        const data = await response.json();
        const rates: Partial<ExchangeRates> = {};

        // Mapping Mongol Bank codes to our ExchangeRates interface
        const codeMap: Record<string, keyof ExchangeRates> = {
            'USD': 'MNT',
            'CNY': 'CNY',
            'KRW': 'KRW',
            'JPY': 'JPY',
            'THB': 'THB',
            'EUR': 'EUR'
        };

        data.forEach((item: any) => {
            if (codeMap[item.code]) {
                rates[codeMap[item.code]] = parseFloat(item.rate.replace(/,/g, ''));
            }
        });

        // Ensure all required rates are present, fallback to verified if missing
        const result: ExchangeRates = {
            MNT: rates.MNT || VERIFIED_RATES.MNT,
            CNY: rates.MNT ? (rates.MNT / (rates.CNY || 1)) : VERIFIED_RATES.CNY, // Normalize if needed
            KRW: rates.MNT ? (rates.MNT / (rates.KRW || 1)) : VERIFIED_RATES.KRW,
            JPY: rates.MNT ? (rates.MNT / (rates.JPY || 1)) : VERIFIED_RATES.JPY,
            THB: rates.MNT ? (rates.MNT / (rates.THB || 1)) : VERIFIED_RATES.THB,
            EUR: rates.MNT ? (rates.MNT / (rates.EUR || 1)) : VERIFIED_RATES.EUR
        };

        // Note: Mongol Bank provides rates in MNT per 1 unit of foreign currency.
        // Our interface assumes 'MNT' is USD to MNT, and others are USD to Local.
        // We need to convert Mongol Bank's MNT-centric rates to our USD-centric rates.

        const usdToMnt = rates.MNT || VERIFIED_RATES.MNT;

        return {
            MNT: usdToMnt,
            CNY: usdToMnt / (rates.CNY || 480), // Approx MNT for 1 CNY -> USD/CNY
            KRW: usdToMnt / (rates.KRW || 2.5), // Approx MNT for 1 KRW -> USD/KRW
            JPY: usdToMnt / (rates.JPY || 23),  // Approx MNT for 1 JPY -> USD/JPY
            THB: usdToMnt / (rates.THB || 95),  // Approx MNT for 1 THB -> USD/THB
            EUR: usdToMnt / (rates.EUR || 3700) // Approx MNT for 1 EUR -> USD/EUR
        };
    } catch (error) {
        console.error("Exchange rate fetch failed, using fallbacks:", error);
        return VERIFIED_RATES;
    }
}

/**
 * Formats a budget into the requested triple-currency string:
 * MNT, Local, USD
 */
export function formatTripleBudget(usdAmount: number, rates: ExchangeRates, localCurrency: keyof ExchangeRates): string {
    const mnt = Math.round(usdAmount * rates.MNT).toLocaleString();
    const local = Math.round(usdAmount * rates[localCurrency]).toLocaleString();
    const usd = usdAmount.toLocaleString();

    const symbols: Record<string, string> = {
        MNT: '₮',
        CNY: '¥',
        KRW: '₩',
        JPY: '¥',
        THB: '฿',
        USD: '$'
    };

    const localSymbol = symbols[localCurrency as string] || localCurrency;

    return `${mnt} ₮ / ${local} ${localSymbol} / ${usd} $`;
}
