import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: Record<string, boolean>; // per-layout key
  mobileMenuOpen: boolean;
  toggleSidebar: (key: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: {},
      mobileMenuOpen: false,
      toggleSidebar: (key) =>
        set((state) => ({
          sidebarCollapsed: {
            ...state.sidebarCollapsed,
            [key]: !state.sidebarCollapsed[key],
          },
        })),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    {
      name: "vstory-ui",
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);
