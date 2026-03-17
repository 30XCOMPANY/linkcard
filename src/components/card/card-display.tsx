/**
 * [INPUT]: @/src/tw View/Text, @/src/types LinkedInProfile/CardVersion,
 *          CardField, Avatar, QRCode, @/src/lib/cn
 * [OUTPUT]: CardDisplay — physical card with Robinhood-style presence
 * [POS]: Card core — hero element, credit-card proportions, accent bg, soft shadow
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { View, Text } from "@/src/tw";
import { cn } from "@/src/lib/cn";
import { CardField } from "./card-field";
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
  const { visibleFields, fieldStyles = {}, accentColor } = version;
  const vis = (f: string) => visibleFields.includes(f as any);

  return (
    <View
      className={cn("rounded-3xl overflow-hidden", className)}
      style={{
        borderCurve: "continuous" as any,
        boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
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
      <View className={cn("bg-sf-card", compact ? "p-4" : "p-5")}>
        {/* Top row: Avatar + Name block */}
        <View className="flex-row items-start">
          {/* Avatar */}
          {vis("photoUrl") && (
            <View className="mr-4">
              <Avatar
                source={profile.photoUrl}
                name={profile.name}
                size={compact ? 56 : 72}
                accentColor={accentColor}
                showBorder
              />
            </View>
          )}

          {/* Name + Title */}
          <View className="flex-1 justify-center">
            {vis("name") && (
              <CardField
                field="name"
                value={profile.name}
                fieldStyle={fieldStyles.name}
              />
            )}
            {vis("jobTitle") && profile.jobTitle && (
              <CardField
                field="jobTitle"
                value={profile.jobTitle}
                fieldStyle={fieldStyles.jobTitle}
                className="mt-1"
              />
            )}
          </View>
        </View>

        {/* Headline */}
        {vis("headline") && (
          <CardField
            field="headline"
            value={profile.headline}
            fieldStyle={fieldStyles.headline}
            className="mt-4"
          />
        )}

        {/* Character tags */}
        {vis("character") && profile.character && (
          <View className="flex-row flex-wrap gap-1.5 mt-3">
            {profile.character.split(",").map((tag, i) => (
              <View
                key={i}
                className="rounded-full px-2.5 py-0.5"
                style={{ backgroundColor: accentColor + "15" }}
              >
                <Text
                  className="text-caption-1 font-medium"
                  style={{ color: accentColor }}
                >
                  {tag.trim()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Accent divider */}
        <View
          className="h-[2px] rounded-full mt-4 mb-3"
          style={{ backgroundColor: accentColor + "30", width: 32 }}
        />

        {/* Company + Location */}
        {(vis("company") || vis("location")) && (
          <View className="flex-row items-center gap-1.5">
            {vis("company") && (
              <CardField
                field="company"
                value={profile.company}
                fieldStyle={fieldStyles.company}
              />
            )}
            {vis("company") && vis("location") && profile.company && profile.location && (
              <Text className="text-sf-text-3 text-subheadline">·</Text>
            )}
            {vis("location") && (
              <CardField
                field="location"
                value={profile.location}
                fieldStyle={fieldStyles.location}
              />
            )}
          </View>
        )}

        {/* Contact fields */}
        {(vis("email") || vis("phone") || vis("website")) && (
          <View className="gap-0.5 mt-2">
            {vis("email") && profile.email && (
              <CardField field="email" value={profile.email} fieldStyle={fieldStyles.email} />
            )}
            {vis("phone") && profile.phone && (
              <CardField field="phone" value={profile.phone} fieldStyle={fieldStyles.phone} />
            )}
            {vis("website") && profile.website && (
              <CardField field="website" value={profile.website} fieldStyle={fieldStyles.website} />
            )}
          </View>
        )}
      </View>
    </View>
  );
}
