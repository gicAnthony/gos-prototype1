"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type GOSState = {
  tenantId: string;
  wallpaper: string;
  setTenantId: (tenantId: string) => void;
  setWallpaper: (wallpaper: string) => void;
};

export const useGOSStore = create<GOSState>()(
  persist(
    (set) => ({
      tenantId: "gic",
      wallpaper: "aurora",
      setTenantId: (tenantId) => set({ tenantId }),
      setWallpaper: (wallpaper) => set({ wallpaper }),
    }),
    { name: "gos-preferences" },
  ),
);
