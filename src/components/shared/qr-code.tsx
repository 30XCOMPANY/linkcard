/**
 * [INPUT]: react-native-qrcode-svg, @/src/tw View
 * [OUTPUT]: QRCode component — minimal wrapper around QRCodeSVG
 * [POS]: Shared QR renderer — Tailwind-styled port of qr/QRCode, no LinkedIn variant
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { View } from "@/src/tw";
import QRCodeSVG from "react-native-qrcode-svg";

interface QRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export function QRCode({
  value,
  size = 150,
  color = "#000000",
  backgroundColor = "#FFFFFF",
  className,
}: QRCodeProps) {
  return (
    <View
      className={className}
      style={{
        alignSelf: "center",
        padding: size * 0.1,
        backgroundColor,
        borderRadius: 12,
      }}
    >
      <QRCodeSVG
        value={value}
        size={size}
        color={color}
        backgroundColor={backgroundColor}
      />
    </View>
  );
}
