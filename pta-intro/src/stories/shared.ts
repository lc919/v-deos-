import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

export const ORANGE = "#FF5A2E";
export const NAVY = "#141827";

// Fontes variáveis locais (baixadas do Google Fonts para public/fonts).
export const figtree = "Figtree";
export const outfit = "Outfit";
loadFont({ family: figtree, url: staticFile("fonts/Figtree.woff2"), weight: "300 900" });
loadFont({ family: outfit, url: staticFile("fonts/Outfit.woff2"), weight: "100 900" });

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
export const snappy = Easing.bezier(0.16, 1, 0.3, 1);
export const overshoot = Easing.bezier(0.34, 1.56, 0.64, 1);
