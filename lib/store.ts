"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type GOSState = {
  tenantId: string;
  wallpaper: string;
  mode: "dark" | "light";
  accent: string;
  setTenantId: (tenantId: string) => void;
  setWallpaper: (wallpaper: string) => void;
  setMode: (mode: "dark" | "light") => void;
  setAccent: (accent: string) => void;
};

export const useGOSStore = create<GOSState>()(
  persist(
    (set) => ({
      tenantId: "gic",
      wallpaper: "aurora",
      mode: "dark",
      accent: "#F6921E",
      setTenantId: (tenantId) => set({ tenantId }),
      setWallpaper: (wallpaper) => set({ wallpaper }),
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
    }),
    { name: "gos-preferences" },
  ),
);
