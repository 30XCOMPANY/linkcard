/**
 * [INPUT]: @/src/tw View/Text, @/src/types LinkedInProfile/CardVersion, CardField, Avatar, QRCode
 * [OUTPUT]: CardDisplay component — renders a complete business card
 * [POS]: Card core — hero element on home screen, preview on share/editor
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { View, Text } from "@/src/tw";
import { cn } from "@/src/lib/cn";
import { CardField } from "./card-field";
import { Avatar } from "@/src/components/shared/avatar";
import { QRCode } from "@/src/components/shared/qr-code";
import type { LinkedInProfile, CardVersion } from "@/src/types";
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";

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

  const isFieldVisible = (field: string) => visibleFields.includes(field as any);

  return (
    <View
      className={cn(
        "bg-sf-card rounded-3xl overflow-hidden",
        compact ? "p-4" : "p-6",
        className
      )}
      style={{
        borderCurve: "continuous" as any,
        boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* QR Overlay */}
      {showQR && (
        <Animated.View
          entering={ZoomIn.springify()}
          exiting={ZoomOut.duration(200)}
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: 24,
          }}
        >
          <QRCode value={qrCodeData} size={compact ? 160 : 200} />
          <Text className="text-xs text-sf-text-2 mt-4" selectable>
            {qrCodeData}
          </Text>
        </Animated.View>
      )}

      {/* Avatar */}
      {isFieldVisible("photoUrl") && (
        <View className="mb-4">
          <Avatar
            source={profile.photoUrl}
            name={profile.name}
            size={compact ? "lg" : "xl"}
            accentColor={accentColor}
          />
        </View>
      )}

      {/* Name */}
      {isFieldVisible("name") && (
        <CardField
          field="name"
          value={profile.name}
          fieldStyle={fieldStyles.name}
          className={compact ? "text-xl" : undefined}
        />
      )}

      {/* Job Title */}
      {isFieldVisible("jobTitle") && profile.jobTitle && (
        <CardField
          field="jobTitle"
          value={profile.jobTitle}
          fieldStyle={fieldStyles.jobTitle}
          className="mt-1"
        />
      )}

      {/* Headline */}
      {isFieldVisible("headline") && (
        <CardField
          field="headline"
          value={profile.headline}
          fieldStyle={fieldStyles.headline}
          className="mt-2"
        />
      )}

      {/* Character tags */}
      {isFieldVisible("character") && profile.character && (
        <View className="flex-row flex-wrap gap-1.5 mt-3">
          {profile.character.split(",").map((tag, i) => (
            <View key={i} className="bg-sf-bg-2 rounded-full px-3 py-1">
              <Text className="text-xs text-sf-text-2">{tag.trim()}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Company + Location row */}
      <View className="flex-row items-center gap-2 mt-4">
        {isFieldVisible("company") && (
          <CardField
            field="company"
            value={profile.company}
            fieldStyle={fieldStyles.company}
          />
        )}
        {isFieldVisible("company") && isFieldVisible("location") && profile.company && profile.location && (
          <Text className="text-sf-text-3">·</Text>
        )}
        {isFieldVisible("location") && (
          <CardField
            field="location"
            value={profile.location}
            fieldStyle={fieldStyles.location}
          />
        )}
      </View>

      {/* Contact fields */}
      <View className="gap-1 mt-3">
        {isFieldVisible("email") && profile.email && (
          <CardField field="email" value={profile.email} fieldStyle={fieldStyles.email} />
        )}
        {isFieldVisible("phone") && profile.phone && (
          <CardField field="phone" value={profile.phone} fieldStyle={fieldStyles.phone} />
        )}
        {isFieldVisible("website") && profile.website && (
          <CardField field="website" value={profile.website} fieldStyle={fieldStyles.website} />
        )}
      </View>
    </View>
  );
}
