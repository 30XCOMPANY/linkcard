/**
 * [INPUT]: @/src/tw Text, @/src/types FieldStyle
 * [OUTPUT]: CardField component — renders a single card field with typography
 * [POS]: Card subcomponent — maps field names to Tailwind styles, respects FieldStyle overrides
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { Text } from "@/src/tw";
import { cn } from "@/src/lib/cn";
import type { FieldStyle } from "@/src/types";

interface CardFieldProps {
  field: string;
  value: string;
  fieldStyle?: FieldStyle;
  className?: string;
}

const fieldTypeMap: Record<string, string> = {
  name: "text-2xl font-bold text-sf-text",
  headline: "text-base text-sf-text leading-relaxed",
  jobTitle: "text-sm font-medium text-sf-text-2",
  company: "text-sm font-bold text-sf-text",
  location: "text-sm text-sf-text-2",
  email: "text-sm text-sf-blue",
  phone: "text-sm text-sf-blue",
  website: "text-sm text-sf-blue underline",
  character: "text-xs text-sf-text-2",
};

export function CardField({ field, value, fieldStyle, className }: CardFieldProps) {
  if (!value?.trim()) return null;

  const baseClass = fieldTypeMap[field] ?? "text-sm text-sf-text";

  // Apply fieldStyle overrides as inline style
  const overrideStyle: Record<string, any> = {};
  if (fieldStyle?.fontSize) overrideStyle.fontSize = fieldStyle.fontSize;
  if (fieldStyle?.fontWeight) {
    const weightMap: Record<string, string> = {
      regular: "400", medium: "500", bold: "700",
    };
    overrideStyle.fontWeight = weightMap[fieldStyle.fontWeight] ?? fieldStyle.fontWeight;
  }
  if (fieldStyle?.color) overrideStyle.color = fieldStyle.color;
  if (fieldStyle?.lineHeight) overrideStyle.lineHeight = fieldStyle.lineHeight;
  if (fieldStyle?.textAlign) overrideStyle.textAlign = fieldStyle.textAlign;

  return (
    <Text
      className={cn(baseClass, className)}
      style={Object.keys(overrideStyle).length > 0 ? overrideStyle : undefined}
      selectable
    >
      {value}
    </Text>
  );
}
