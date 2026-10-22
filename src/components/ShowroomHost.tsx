"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { loadHomeMedia } from "@/content/home-media";
import { useShowroomStore } from "@/store/showroom-store";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { sceneInteraction } from "@/store/scroll-store";

const ShowroomCanvas = dynamic(() => import("./3d/ShowroomCanvas"), { ssr: false });

/** One WebGL context per visit. Route changes hide and pause it, not dispose it. */
export default function ShowroomHost() {
  const pathname = usePathname();
  const active = pathname === "/";
  const [initialized, setInitialized] = useState(false);
  const [visible, setVisible] = useState(true);
  const menuOpen = useShowroomStore((state) => state.menuOpen);
  const navigationFrom = useShowroomStore((state) => state.navigationFrom);
  const authOpen = useAuthStore((state) => state.showAuthModal);
  const cartOpen = useCartStore((state) => state.isCartOpen);
  const running = active && visible && !menuOpen && !authOpen && !cartOpen && navigationFrom !== pathname;

  useEffect(() => {
    if (!active || initialized) return;
    const abort = new AbortController();
    const initialize = async () => {
      // Finish the manifest before useTexture reads its URLs. Prepare surfaces
      // in separate tasks before importing the rooms' module-level materials.
      await loadHomeMedia();
      if (abort.signal.aborted) return;
      const { preloadTextures } = await import("./3d/preload");
      if (abort.signal.aborted) return;
      await preloadTextures(abort.signal);
      if (!abort.signal.aborted) setInitialized(true);
    };
    void initialize();
    return () => abort.abort();
  }, [active, initialized]);

  useEffect(() => {
    useShowroomStore.getState().endNavigation();
    sceneInteraction.hovered = false;
    sceneInteraction.focused = false;
  }, [pathname]);

  useEffect(() => {
    if (navigationFrom === null) return;
    // A cancelled/failed route must not leave the current scene paused forever.
    const timer = setTimeout(() => useShowroomStore.getState().endNavigation(), 10000);
    return () => clearTimeout(timer);
  }, [navigationFrom]);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onVisibility);
    onVisibility();
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onVisibility);
    };
  }, []);

  useEffect(() => {
    useShowroomStore.getState().setRunning(running);
    return () => useShowroomStore.getState().setRunning(false);
  }, [running]);

  // Once mounted, retain this canvas across routes. Mounting it hidden still
  // builds every room and texture, even with frameloop="never".
  if (!initialized) return null;

  return (
    <div
      data-showroom-host
      className="fixed inset-0 z-0"
      aria-hidden={!active}
      inert={!active}
      style={{ visibility: active ? "visible" : "hidden", pointerEvents: active ? "auto" : "none" }}
    >
      <ShowroomCanvas active={active} running={running} />
    </div>
  );
}
