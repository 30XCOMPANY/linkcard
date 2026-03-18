/**
 * [INPUT]: react, react-native View/Text/TextInput/Pressable/PlatformColor, @/src/lib/haptics
 * [OUTPUT]: EditableText — inline tap-to-edit text field used by the home hero card
 * [POS]: screens/home editing primitive reused by the card editor and future inline-edit surfaces
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";

interface EditableTextProps {
  value: string;
  style: StyleProp<TextStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  placeholder: string;
  multiline?: boolean;
  onSave: (value: string) => void;
}

export function EditableText({
  value,
  style,
  wrapperStyle,
  placeholder,
  multiline,
  onSave,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [editing, value]);

  if (editing) {
    return (
      <View style={wrapperStyle}>
        <TextInput
          autoFocus
          blurOnSubmit={!multiline}
          multiline={multiline}
          onBlur={() => {
            const nextValue = draft.trim();

            setEditing(false);

            if (nextValue && nextValue !== value) {
              onSave(nextValue);
              haptic.success();
              return;
            }

            setDraft(value);
          }}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor={platformColor("tertiaryLabel")}
          returnKeyType={multiline ? "default" : "done"}
          style={[style, { margin: 0, padding: 0 }]}
          value={draft}
        />
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => {
        haptic.light();
        setDraft(value);
        setEditing(true);
      }}
    >
      <View style={wrapperStyle}>
        {value ? (
          <Text style={style}>{value}</Text>
        ) : (
          <Text
            style={[
              style,
              { color: platformColor("tertiaryLabel") },
            ]}
          >
            {placeholder}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
