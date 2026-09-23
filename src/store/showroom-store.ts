"use client";

import { create } from "zustand";

interface ShowroomState {
  menuOpen: boolean;
  navigationFrom: string | null;
  running: boolean;
  setMenuOpen: (open: boolean) => void;
  beginNavigation: (pathname: string) => void;
  endNavigation: () => void;
  setRunning: (running: boolean) => void;
}

export const useShowroomStore = create<ShowroomState>((set) => ({
  menuOpen: false,
  navigationFrom: null,
  running: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  beginNavigation: (navigationFrom) => set({ navigationFrom }),
  endNavigation: () => set({ navigationFrom: null }),
  setRunning: (running) => set({ running }),
}));
