/**
 * [INPUT]: react/useEffect/useMemo/useState, react-native ScrollView/StyleSheet/Text/View/Image,
 *          expo-router useLocalSearchParams, @/src/components/card/card-display, @/src/lib/public-url
 * [OUTPUT]: PublicCardScreen — read-only public card route mounted at `/u/[slug]`
 * [POS]: Public route entry — fetches shared card payloads or query fallback data without touching app-private navigation
 * [PROTOCOL]: Update this header on change, then check AGENTS.md
 */

import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { CardDisplay } from "@/src/components/card/card-display";
import { buildPublicCardPath, PUBLIC_SITE_URL, sanitizePublicSlug } from "@/src/lib/public-url";
import type { CardVersion, LinkedInProfile } from "@/src/types";

interface PublicSharePayload {
  profile: Partial<LinkedInProfile>;
  qrCodeData?: string;
  viewCount?: number;
}

const API_BASE_URL =
  (typeof window !== "undefined" && window.location?.origin) ||
  process.env.EXPO_PUBLIC_API_URL ||
  "";

const DEFAULT_VERSION: CardVersion = {
  id: "public",
  name: "Public Card",
  visibleFields: ["photoUrl", "name", "headline", "company", "location", "qrCode"],
  template: "modern",
  accentColor: "#2563EB",
  background: "lightGlass",
  isDefault: true,
};

const asString = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

const buildFallbackProfile = (params: Record<string, string | string[] | undefined>): LinkedInProfile => ({
  url: asString(params.profileUrl),
  username: asString(params.slug),
  name: asString(params.name) || "Public Card",
  headline: asString(params.headline),
  jobTitle: asString(params.jobTitle) || undefined,
  company: asString(params.company),
  location: asString(params.location),
  city: undefined,
  bannerUrl: null,
  photoUrl: asString(params.photoUrl) || null,
  email: undefined,
  phone: undefined,
  website: asString(params.website) || undefined,
  character: undefined,
  socialLinks: undefined,
  publications: undefined,
  lastSynced: new Date(),
  checksum: `public-${asString(params.slug) || "fallback"}`,
});

export default function PublicCardScreen() {
  const params = useLocalSearchParams<Record<string, string | string[] | undefined>>();
  const slug = sanitizePublicSlug(asString(params.slug));
  const [state, setState] = useState<{
    status: "loading" | "ready" | "missing";
    payload: PublicSharePayload | null;
  }>({ status: "loading", payload: null });

  useEffect(() => {
    let cancelled = false;
    const fallbackName = asString(params.name);

    const load = async () => {
      if (!slug) {
        if (!cancelled) setState({ status: "missing", payload: null });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/share/${slug}`);
        if (!response.ok) {
          throw new Error(`Share fetch failed with ${response.status}`);
        }
        const payload = (await response.json()) as PublicSharePayload;
        if (!cancelled) {
          setState({ status: "ready", payload });
        }
      } catch {
        if (!cancelled) {
          if (fallbackName) {
            setState({
              status: "ready",
              payload: {
                profile: buildFallbackProfile(params),
                qrCodeData: asString(params.qrCodeData) || undefined,
              },
            });
            return;
          }
          setState({ status: "missing", payload: null });
        }
      }
    };

    load().catch(() => {
      if (!cancelled) setState({ status: "missing", payload: null });
    });

    return () => {
      cancelled = true;
    };
  }, [params, slug]);

  const profile = useMemo(() => {
    if (!state.payload?.profile) return null;
    const source = state.payload.profile;
    return {
      ...buildFallbackProfile(params),
      ...source,
      name: source.name || buildFallbackProfile(params).name,
      headline: source.headline || "",
      company: source.company || "",
      location: source.location || "",
      photoUrl: source.photoUrl ?? null,
      lastSynced: new Date(),
      checksum: `public-${slug || "unknown"}`,
    } as LinkedInProfile;
  }, [params, slug, state.payload?.profile]);

  if (state.status === "loading") {
    return (
      <View style={styles.statePage}>
        <Text style={styles.stateEyebrow}>PUBLIC CARD</Text>
        <Text style={styles.stateTitle}>Loading {buildPublicCardPath(slug || "card")}…</Text>
      </View>
    );
  }

  if (state.status === "missing" || !profile) {
    return (
      <View style={styles.statePage}>
        <Text style={styles.stateEyebrow}>PUBLIC CARD</Text>
        <Text style={styles.stateTitle}>This public card is unavailable.</Text>
        <Text style={styles.stateBody}>
          The reserved public namespace still lives at
          {" "}
          <Text style={styles.inlineCode}>{PUBLIC_SITE_URL}/u/…</Text>
          , but this slug does not resolve to a published payload.
        </Text>
      </View>
    );
  }

  const qrCodeData = state.payload?.qrCodeData || profile.url || profile.website || `${PUBLIC_SITE_URL}/u/${slug}`;

  return (
    <ScrollView
      style={styles.page}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.stateEyebrow}>PUBLIC CARD</Text>
        <Text style={styles.publicUrl}>{buildPublicCardPath(slug)}</Text>
      </View>
      <View style={styles.cardWrap}>
        <CardDisplay profile={profile} version={DEFAULT_VERSION} qrCodeData={qrCodeData} />
      </View>
      <View style={styles.meta}>
        <Image source={require("@/assets/icon.png")} style={styles.logo} />
        <Text style={styles.metaText}>
          Read-only public preview for LinkCard shares. Marketing pages stay on the root path;
          published cards live under the reserved
          {" "}
          <Text style={styles.inlineCode}>/u/</Text>
          {" "}
          namespace.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 64,
    alignItems: "center",
  },
  header: {
    width: "100%",
    maxWidth: 520,
    marginBottom: 20,
  },
  statePage: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateEyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#2563EB",
    marginBottom: 12,
  },
  stateTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    textAlign: "center",
    color: "#0F172A",
  },
  stateBody: {
    marginTop: 12,
    maxWidth: 560,
    fontSize: 16,
    lineHeight: 24,
    color: "#475569",
    textAlign: "center",
  },
  publicUrl: {
    fontSize: 15,
    lineHeight: 20,
    color: "#475569",
    fontFamily: "JetBrainsMono_400Regular",
  },
  cardWrap: {
    width: "100%",
    maxWidth: 520,
  },
  meta: {
    width: "100%",
    maxWidth: 520,
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    alignItems: "center",
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  metaText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },
  inlineCode: {
    fontFamily: "JetBrainsMono_400Regular",
    color: "#0F172A",
  },
});
