"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={3 * 60} // refresh session every 5 minutes instead of on every tab switch
    >
      {children}
    </SessionProvider>
  );
}
