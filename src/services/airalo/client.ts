/**
 * Airalo Partner API Client
 * Handles authentication, package fetching, and order creation
 */

import {
    AiraloConfig,
    AiraloAuthResponse,
    AiraloPackagesResponse,
    AiraloOrderRequest,
    AiraloOrderResponse,
    AiraloSimUsage,
    AiraloSimInstructions,
    AiraloCountry,
} from "./types";

class AiraloClient {
    private config: AiraloConfig;
    private accessToken: string | null = null;
    private tokenExpiresAt: Date | null = null;

    constructor(config?: Partial<AiraloConfig>) {
        this.config = {
            clientId: config?.clientId || process.env.AIRALO_CLIENT_ID || "",
            clientSecret: config?.clientSecret || process.env.AIRALO_CLIENT_SECRET || "",
            apiUrl: config?.apiUrl || process.env.AIRALO_API_URL || "https://sandbox-partners-api.airalo.com/v2",
            environment: (config?.environment || process.env.AIRALO_ENV || "sandbox") as "sandbox" | "production",
        };
    }

    /**
     * Get authentication token
     */
    private async authenticate(): Promise<string> {
        // Check if we have a valid token
        if (this.accessToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
            return this.accessToken;
        }

        const response = await fetch(`${this.config.apiUrl}/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: new URLSearchParams({
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                grant_type: "client_credentials",
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Airalo authentication failed: ${error.meta?.message || response.statusText}`);
        }

        const data: AiraloAuthResponse = await response.json();
        this.accessToken = data.data.access_token;
        this.tokenExpiresAt = new Date(Date.now() + (data.data.expires_in - 60) * 1000);

        return this.accessToken;
    }

    /**
     * Make authenticated API request
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = await this.authenticate();

        const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                `Airalo API error: ${error.meta?.message || response.statusText}`
            );
        }

        return response.json();
    }

    /**
     * Get all packages (with pagination)
     */
    async getAllPackages(options?: {
        limit?: number;
        page?: number;
        flat?: boolean;
    }): Promise<AiraloPackagesResponse> {
        const params = new URLSearchParams();
        if (options?.limit) params.set("limit", options.limit.toString());
        if (options?.page) params.set("page", options.page.toString());

        const query = params.toString();
        const endpoint = `/packages${query ? `?${query}` : ""}`;

        return this.request<AiraloPackagesResponse>(endpoint);
    }

    /**
     * Get local packages (country-specific)
     */
    async getLocalPackages(options?: {
        limit?: number;
        page?: number;
    }): Promise<AiraloPackagesResponse> {
        const params = new URLSearchParams();
        params.set("type", "local");
        if (options?.limit) params.set("limit", options.limit.toString());
        if (options?.page) params.set("page", options.page.toString());

        return this.request<AiraloPackagesResponse>(`/packages?${params}`);
    }

    /**
     * Get packages for a specific country
     */
    async getCountryPackages(countrySlug: string): Promise<AiraloPackagesResponse> {
        return this.request<AiraloPackagesResponse>(
            `/packages?filter[slug]=${countrySlug}`
        );
    }

    /**
     * Get global/regional packages
     */
    async getGlobalPackages(): Promise<AiraloPackagesResponse> {
        return this.request<AiraloPackagesResponse>("/packages?type=global");
    }

    /**
     * Get available countries
     */
    async getCountries(): Promise<{ data: AiraloCountry[] }> {
        return this.request<{ data: AiraloCountry[] }>("/countries");
    }

    /**
     * Create an order
     */
    async createOrder(order: AiraloOrderRequest): Promise<AiraloOrderResponse> {
        return this.request<AiraloOrderResponse>("/orders", {
            method: "POST",
            body: JSON.stringify(order),
        });
    }

    /**
     * Create async order (returns immediately, uses webhook)
     */
    async createOrderAsync(
        order: AiraloOrderRequest & { webhook_url?: string }
    ): Promise<{ data: { request_id: string } }> {
        return this.request<{ data: { request_id: string } }>("/orders/async", {
            method: "POST",
            body: JSON.stringify(order),
        });
    }

    /**
     * Get SIM usage information
     */
    async getSimUsage(iccid: string): Promise<{ data: AiraloSimUsage }> {
        return this.request<{ data: AiraloSimUsage }>(`/sims/${iccid}/usage`);
    }

    /**
     * Get SIM installation instructions
     */
    async getSimInstructions(iccid: string): Promise<AiraloSimInstructions> {
        return this.request<AiraloSimInstructions>(`/sims/${iccid}/instructions`);
    }

    /**
     * Top up an existing eSIM
     */
    async topUp(
        iccid: string,
        packageId: string,
        description?: string
    ): Promise<AiraloOrderResponse> {
        return this.request<AiraloOrderResponse>("/orders/topups", {
            method: "POST",
            body: JSON.stringify({
                package_id: packageId,
                iccid,
                description,
            }),
        });
    }

    /**
     * Check compatible devices
     */
    async getCompatibleDevices(): Promise<{
        data: Array<{
            brand: string;
            models: Array<{
                name: string;
                esim_support: boolean;
            }>;
        }>;
    }> {
        return this.request("/compatible-devices");
    }

    /**
     * Get exchange rates
     */
    async getExchangeRates(): Promise<{
        data: Record<string, number>;
    }> {
        return this.request("/exchange-rates");
    }
}

// Export singleton instance
export const airalo = new AiraloClient();

// Export class for custom instances
export { AiraloClient };
