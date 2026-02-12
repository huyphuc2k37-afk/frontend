"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/lib/api";

export interface UserProfile {
  name: string;
  email: string;
  image?: string;
  role: string; // "reader" | "author" | "admin"
  bio?: string;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const token = (session as any)?.accessToken as string | undefined;

  const fetchProfile = () => {
    if (status !== "authenticated" || !token) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setProfile({
          name: data.name,
          email: data.email,
          image: data.image,
          role: data.role,
          bio: data.bio,
        });
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      setProfile(null);
      setLoading(false);
      return;
    }
    if (status === "loading") {
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, token]);

  return (
    <UserProfileContext.Provider value={{ profile, loading, refresh: fetchProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}
