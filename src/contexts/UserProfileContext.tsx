"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCachedFetch, invalidateCacheKey } from "@/lib/useCachedFetch";

export interface UserProfile {
  name: string;
  email: string;
  image?: string;
  role: string; // "reader" | "author" | "admin" | "moderator"
  bio?: string;
  coinBalance?: number;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  /** Re-fetch profile (e.g. after role upgrade) */
  refresh: () => void;
}

const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  loading: true,
  refresh: () => {},
});

export const useUserProfile = () => useContext(UserProfileContext);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const email = (session?.user?.email as string | undefined)?.toLowerCase();

  // Cache key is per-user, so multiple components share 1 fetch.
  const cacheKey = email ? `profile:${email}` : "profile:none";
  // Re-fetch profile every 30s so DB role changes propagate quickly (e.g. admin
  // promotion) without forcing a full page reload. Focus + token changes also
  // trigger a fresh fetch.
  const { data, mutate } = useCachedFetch<UserProfile>(
    cacheKey,
    "/api/profile",
    token,
    { revalidateMs: 30_000, revalidateOnFocus: true, skip: status !== "authenticated" || !token },
  );

  // When the session transitions from unauthenticated → authenticated we must
  // invalidate the cache for the current user, otherwise the previous
  // (pre-logout) profile is returned instantly from the in-memory cache and
  // the UI shows a stale role until the next revalidate interval (30s) or
  // focus event. Same for the token changing — a fresh JWT should fetch a
  // fresh profile.
  const prevStatusRef = useRef<string>(status);
  const prevTokenRef = useRef<string | undefined>(token);
  useEffect(() => {
    const statusChanged = prevStatusRef.current !== status;
    const tokenChanged = prevTokenRef.current !== token;
    prevStatusRef.current = status;
    prevTokenRef.current = token;
    if (status === "authenticated" && token && (statusChanged || tokenChanged)) {
      invalidateCacheKey(cacheKey);
      mutate();
    }
  }, [status, token, cacheKey, mutate]);

  // Map backend response → UI shape. Backend may return role and coinBalance.
  // The backend is the source of truth for role — we no longer read it from
  // the NextAuth session/JWT (see [...nextauth]/route.ts jwt callback).
  const profile: UserProfile | null = useMemo(() => {
    if (!data) return null;
    return {
      name: (data as any).name,
      email: (data as any).email,
      image: (data as any).image,
      role: (data as any).role,
      bio: (data as any).bio,
    };
  }, [data]);

  const loading = status === "loading" || (status === "authenticated" && profile === null && !data);

  // Memoize the context value. Without this, every render creates a new object
  // which retriggers consumers' useSyncExternalStore selectors and produces the
  // "getServerSnapshot should be cached" infinite-loop warning.
  const ctxValue = useMemo<UserProfileContextType>(
    () => ({ profile, loading, refresh: mutate }),
    [profile, loading, mutate]
  );

  return (
    <UserProfileContext.Provider value={ctxValue}>
      {children}
    </UserProfileContext.Provider>
  );
}
