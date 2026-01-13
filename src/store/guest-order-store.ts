import { create } from "zustand";

interface GuestOrderState {
    recentOrderIds: string[];
    addOrderId: (id: string) => void;
    clearOrderIds: () => void;
}

/**
 * A simple session-based store to track recent guest orders.
 * This is NOT persisted, so it will be cleared on page reload,
 * as requested by the user.
 */
export const useGuestOrderStore = create<GuestOrderState>((set) => ({
    recentOrderIds: [],
    addOrderId: (id: string) =>
        set((state) => ({
            recentOrderIds: state.recentOrderIds.includes(id)
                ? state.recentOrderIds
                : [...state.recentOrderIds, id]
        })),
    clearOrderIds: () => set({ recentOrderIds: [] }),
}));
