"use client";

import { createContext, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useCachedFetch, invalidateCacheKey } from "@/lib/useCachedFetch";

interface WalletBalanceContextType {
  /** Current xu balance, or null while loading. */
  balance: number | null;
  loading: boolean;
  /** Force re-fetch balance (e.g. after purchase or tip). */
  refresh: () => void;
}

const WalletBalanceContext = createContext<WalletBalanceContextType>({
  balance: null,
  loading: false,
  refresh: () => {},
});

export const useWalletBalance = () => useContext(WalletBalanceContext);

/**
 * Shares one /api/wallet request across Header, WalletPage, NotificationsDropdown,
 * StoryCard, etc. — eliminates duplicate fetches on every navigation.
 *
 * Wallet data changes after deposits, purchases, tips, admin gifts. Revalidates:
 *   - every 30s while tab is visible
 *   - on tab focus / visibility
 *   - manually via refresh() after a mutation
 */
export function WalletBalanceProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const email = (session?.user?.email as string | undefined)?.toLowerCase();

  const cacheKey = email ? `wallet:balance:${email}` : "wallet:balance:none";
  const { data, loading, mutate } = useCachedFetch<{ coinBalance?: number; balance?: number }>(
    cacheKey,
    "/api/wallet",
    token,
    {
      revalidateMs: 30_000,
      revalidateOnFocus: true,
      revalidateOnVisibility: true,
      skip: status !== "authenticated" || !token,
    },
  );

  const balance = useMemo(() => {
    if (!data) return null;
    if (typeof data.coinBalance === "number") return data.coinBalance;
    if (typeof data.balance === "number") return data.balance;
    return null;
  }, [data]);

  // Memoize the context value to avoid "getServerSnapshot should be cached"
  // infinite-loop warning when consumers use useSyncExternalStore.
  const ctxValue = useMemo<WalletBalanceContextType>(
    () => ({ balance, loading, refresh: mutate }),
    [balance, loading, mutate]
  );

  return (
    <WalletBalanceContext.Provider value={ctxValue}>
      {children}
    </WalletBalanceContext.Provider>
  );
}

/** Manually invalidate the shared wallet balance cache (e.g. after a deposit). */
export function invalidateWalletBalance(email: string | null | undefined): void {
  invalidateCacheKey(`wallet:balance:${(email || "").toLowerCase() || "none"}`);
}
