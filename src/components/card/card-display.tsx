/**
 * [INPUT]: @/src/tw View/Text, @/src/types LinkedInProfile/CardVersion,
 *          Avatar, QRCode, @/src/lib/cn
 * [OUTPUT]: CardDisplay — LinkCard business card with centered avatar layout
 * [POS]: Card core — hero element, centered avatar, version name top-left, company bottom
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { View, Text } from "@/src/tw";
import { cn } from "@/src/lib/cn";
import { Avatar } from "@/src/components/shared/avatar";
import { QRCode } from "@/src/components/shared/qr-code";
import type { LinkedInProfile, CardVersion } from "@/src/types";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

interface CardDisplayProps {
  profile: LinkedInProfile;
  version: CardVersion;
  qrCodeData: string;
  showQR?: boolean;
  compact?: boolean;
  className?: string;
}

export function CardDisplay({
  profile,
  version,
  qrCodeData,
  showQR = false,
  compact = false,
  className,
}: CardDisplayProps) {
  const { visibleFields, accentColor } = version;
  const vis = (f: string) => visibleFields.includes(f as any);

  return (
    <View
      className={cn("rounded-3xl overflow-hidden", className)}
      style={{
        borderCurve: "continuous" as any,
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
      }}
    >
      {/* QR Overlay */}
      {showQR && (
        <Animated.View
          entering={ZoomIn.springify()}
          exiting={ZoomOut.duration(200)}
          className="absolute inset-0 z-10 items-center justify-center rounded-3xl"
          style={{ backgroundColor: "rgba(255,255,255,0.97)" }}
        >
          <QRCode value={qrCodeData} size={compact ? 140 : 180} />
          <Text className="text-caption-1 text-sf-text-2 mt-4" selectable>
            {qrCodeData}
          </Text>
        </Animated.View>
      )}

      {/* Card surface */}
      <View className={cn("bg-sf-card", compact ? "p-4" : "p-5 pb-4")}>
        {/* Top row: version name + location */}
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <Text className="text-body font-semibold text-sf-text">
              {version.name}
            </Text>
            {vis("location") && profile.location && (
              <Text className="text-caption-1 text-sf-text-2">
                {profile.location}
              </Text>
            )}
          </View>
          {vis("company") && profile.company && (
            <Text className="text-caption-1 text-sf-text-2">
              {profile.company}
            </Text>
          )}
        </View>

        {/* Centered avatar */}
        {vis("photoUrl") && (
          <View className="items-center mb-3">
            <Avatar
              source={profile.photoUrl}
              name={profile.name}
              size={compact ? 64 : 80}
              accentColor={accentColor}
            />
          </View>
        )}

        {/* Name */}
        {vis("name") && (
          <Text
            className={cn(
              "text-center font-bold text-sf-text",
              compact ? "text-title-3" : "text-title-2"
            )}
          >
            {profile.name}
          </Text>
        )}

        {/* Headline / Job Title */}
        {vis("headline") && (
          <Text
            className="text-center text-subheadline text-sf-text-2 mt-1"
            numberOfLines={2}
          >
            {profile.jobTitle
              ? `${profile.jobTitle} at ${profile.company}`
              : profile.headline}
          </Text>
        )}

        {/* Character tag */}
        {vis("character") && profile.character && (
          <View className="items-center mt-3">
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: accentColor + "15" }}
            >
              <Text
                className="text-caption-1 font-medium"
                style={{ color: accentColor }}
              >
                {profile.character}
              </Text>
            </View>
          </View>
        )}

        {/* Bottom bar: Your Links + Direct */}
        <View
          className="flex-row items-center justify-between mt-5 pt-4"
          style={{
            borderTopWidth: 0.5,
            borderTopColor: "rgba(0,0,0,0.06)",
          }}
        >
          <Text className="text-subheadline font-medium text-sf-text">
            LinkCard
          </Text>
          <View className="flex-row items-center gap-1.5">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <Text className="text-subheadline font-medium text-sf-text">
              {version.template.charAt(0).toUpperCase() + version.template.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
