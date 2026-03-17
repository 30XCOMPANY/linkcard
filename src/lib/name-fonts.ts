/**
 * [INPUT]: none (pure constants)
 * [OUTPUT]: NameFontKey, nameFonts map, NAME_FONT_KEYS array
 * [POS]: Core utility — user-selectable name font presets for profile display
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

export type NameFontKey = "classic" | "modern" | "mono" | "system";

interface NameFontDef {
  label: string;
  fontFamily: string | undefined; // undefined = system default
}

export const nameFonts: Record<NameFontKey, NameFontDef> = {
  classic: {
    label: "Classic",
    fontFamily: "GoudyBookletter1911_400Regular",
  },
  modern: {
    label: "Modern",
    fontFamily: "DMSans_700Bold",
  },
  mono: {
    label: "Mono",
    fontFamily: "JetBrainsMono_700Bold",
  },
  system: {
    label: "System",
    fontFamily: undefined,
  },
};

export const NAME_FONT_KEYS: NameFontKey[] = ["classic", "modern", "mono", "system"];
