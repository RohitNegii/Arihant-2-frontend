"use client";

import * as THREE from "three";
import { quality } from "./quality";

const hasDOM = typeof window !== "undefined";

export interface SurfaceMaps {
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}

export interface PlasterMaps extends SurfaceMaps {
  map: THREE.Texture;
}

export interface StoneSlabMaps extends SurfaceMaps {
  map: THREE.Texture;
}

export interface LeafMaps {
  map: THREE.Texture;
  alphaMap: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}

export const SLAB_TILE_W = 4.05;
export const SLAB_TILE_D = 3.6;

let loader: THREE.TextureLoader | null = null;
function getLoader(): THREE.TextureLoader | null {
  if (!loader && hasDOM) {
    loader = new THREE.TextureLoader();
  }
  return loader;
}

function loadTexture(
  url: string,
  srgb: boolean,
  repeat = 1,
  clamp = false
): THREE.Texture {
  const l = getLoader();
  if (!l) {
    const fallback = new THREE.Texture();
    return fallback;
  }
  const tex = l.load(url);
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  tex.wrapT = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 8;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

let woodCache: SurfaceMaps | null | undefined;
export function paintedWoodMaps(): SurfaceMaps | null {
  if (woodCache !== undefined) return woodCache;
  if (!hasDOM) return (woodCache = null);

  woodCache = {
    normalMap: loadTexture("/textures/wood-normal.webp", false, 1),
    roughnessMap: loadTexture("/textures/wood-roughness.webp", false, 1),
  };
  return woodCache;
}

let plasterCache: PlasterMaps | null | undefined;
export function plasterMaps(): PlasterMaps | null {
  if (plasterCache !== undefined) return plasterCache;
  if (!hasDOM) return (plasterCache = null);

  plasterCache = {
    map: loadTexture("/textures/plaster-map.webp", true, 1),
    normalMap: loadTexture("/textures/plaster-normal.webp", false, 1),
    roughnessMap: loadTexture("/textures/plaster-roughness.webp", false, 1),
  };
  return plasterCache;
}

let contactCache: THREE.Texture | null | undefined;
export function contactShadowMap(): THREE.Texture | null {
  if (contactCache !== undefined) return contactCache;
  if (!hasDOM) return (contactCache = null);

  contactCache = loadTexture("/textures/contact-shadow.webp", false, 1, true);
  return contactCache;
}

let poolCache: THREE.Texture | null | undefined;
export function lightPoolMap(): THREE.Texture | null {
  if (poolCache !== undefined) return poolCache;
  if (!hasDOM) return (poolCache = null);

  poolCache = loadTexture("/textures/light-pool.webp", false, 1, true);
  return poolCache;
}

let rugCache: (SurfaceMaps & { map: THREE.Texture }) | null | undefined;
export function rugMaps(): (SurfaceMaps & { map: THREE.Texture }) | null {
  if (rugCache !== undefined) return rugCache;
  if (!hasDOM) return (rugCache = null);

  rugCache = {
    map: loadTexture("/textures/rug-map.webp", true, 1, true),
    normalMap: loadTexture("/textures/rug-normal.webp", false, 1, true),
    roughnessMap: loadTexture("/textures/rug-roughness.webp", false, 1, true),
  };
  return rugCache;
}

let slabCache: (SurfaceMaps & { map: THREE.Texture }) | null | undefined;
export function stoneSlabMaps(): (SurfaceMaps & { map: THREE.Texture }) | null {
  if (slabCache !== undefined) return slabCache;
  if (!hasDOM) return (slabCache = null);

  slabCache = {
    map: loadTexture("/textures/stone-slab-map.webp", true, 1),
    normalMap: loadTexture("/textures/stone-slab-normal.webp", false, 1),
    roughnessMap: loadTexture("/textures/stone-slab-roughness.webp", false, 1),
  };
  return slabCache;
}

let brassCache: SurfaceMaps | null | undefined;
export function brassMaps(): SurfaceMaps | null {
  if (brassCache !== undefined) return brassCache;
  if (!hasDOM) return (brassCache = null);

  brassCache = {
    normalMap: loadTexture("/textures/brass-normal.webp", false, 1),
    roughnessMap: loadTexture("/textures/brass-roughness.webp", false, 1),
  };
  return brassCache;
}

let leafCache: LeafMaps | null | undefined;
export function leafMaps(): LeafMaps | null {
  if (leafCache !== undefined) return leafCache;
  if (!hasDOM) return (leafCache = null);

  leafCache = {
    map: loadTexture("/textures/leaf-map.webp", true, 1),
    alphaMap: loadTexture("/textures/leaf-alpha.webp", false, 1),
    normalMap: loadTexture("/textures/leaf-normal.webp", false, 1),
    roughnessMap: loadTexture("/textures/leaf-roughness.webp", false, 1),
  };
  return leafCache;
}
