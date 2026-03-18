/**
 * [INPUT]: react-native ScrollView/Text/Switch/Alert/Platform/PlatformColor/StyleSheet,
 *          @/src/stores/cardStore, @/src/design-system/settings primitives,
 *          @/src/lib/haptics, @/src/lib/icons Icon, @/src/types ContactActionType
 * [OUTPUT]: PrivacyScreen — sharing defaults, contact preferences, share history
 * [POS]: Settings sub-page — privacy controls and contact method configuration
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState } from "react";
import {
  Alert,
  Platform,
  PlatformColor,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
} from "react-native";

import { useCardStore } from "@/src/stores/cardStore";
import { haptic } from "@/src/lib/haptics";
import type { ContactActionType } from "@/src/types";
import {
  SettingsGroup,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
  SettingsChevron,
  SettingsIconTile,
} from "@/src/design-system/settings";

const CONTACT_METHODS: { type: ContactActionType; label: string; placeholder: string }[] = [
  { type: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
  { type: "email", label: "Email", placeholder: "you@example.com" },
  { type: "wechat", label: "WeChat", placeholder: "WeChat ID" },
  { type: "url", label: "Custom URL", placeholder: "https://..." },
];

export default function PrivacyScreen() {
  const card = useCardStore((s) => s.card);
  const updateContactAction = useCardStore((s) => s.updateContactAction);
  const contactAction = card?.contactAction;
  const [includeQR, setIncludeQR] = useState(true);

  const defaultVersion = card?.versions.find((v) => v.isDefault) ?? card?.versions[0];

  const handleContactMethodPick = () => {
    const options = [...CONTACT_METHODS.map((m) => m.label), "Cancel"];
    if (Platform.OS === "ios") {
      const ActionSheetIOS = require("react-native").ActionSheetIOS;
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: CONTACT_METHODS.length },
        (index: number) => {
          if (index >= CONTACT_METHODS.length) return;
          const method = CONTACT_METHODS[index];
          updateContactAction({
            type: method.type,
            label: method.label,
            value: contactAction?.value ?? "",
          });
        }
      );
    } else {
      Alert.alert(
        "Contact Method",
        "Choose how others can reach you",
        CONTACT_METHODS.map((method) => ({
          text: method.label,
          onPress: () =>
            updateContactAction({
              type: method.type,
              label: method.label,
              value: contactAction?.value ?? "",
            }),
        })).concat({ text: "Cancel", onPress: () => {} })
      );
    }
  };

  const handleContactValueEdit = () => {
    const method = CONTACT_METHODS.find((m) => m.type === contactAction?.type);
    Alert.prompt(
      "Contact Value",
      `Enter your ${contactAction?.label ?? "contact"} info`,
      (text) => {
        if (!text?.trim()) return;
        updateContactAction({
          type: contactAction?.type ?? "linkedin",
          label: contactAction?.label ?? "LinkedIn",
          value: text.trim(),
        });
      },
      "plain-text",
      contactAction?.value ?? "",
      method?.placeholder
    );
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <SettingsSectionHeader title="DEFAULT SHARING" />
      <SettingsGroup>
        <SettingsRow
          title="Default Card Version"
          subtitle={defaultVersion?.name ?? "None"}
          leading={<SettingsIconTile web="creditcard" color="#5856D6" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Alert.alert("Card Versions", `Currently using "${defaultVersion?.name ?? "None"}"`);
          }}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Include QR Code"
          subtitle="Show QR code when sharing"
          leading={<SettingsIconTile web="qr-code" color="#000000" />}
          trailing={
            <Switch
              value={includeQR}
              onValueChange={(val) => {
                haptic.selection();
                setIncludeQR(val);
              }}
            />
          }
        />
      </SettingsGroup>

      <SettingsSectionHeader title="CONTACT PREFERENCES" />
      <SettingsGroup>
        <SettingsRow
          title="Contact Method"
          leading={<SettingsIconTile web="person" color="#5856D6" />}
          trailing={
            <Text style={styles.detailText}>
              {contactAction?.label ?? "Not set"}
            </Text>
          }
          onPress={handleContactMethodPick}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Contact Value"
          subtitle={contactAction?.value || "Tap to set"}
          leading={<SettingsIconTile web="link" color="#32ADE6" />}
          trailing={<SettingsChevron />}
          onPress={handleContactValueEdit}
        />
      </SettingsGroup>

      <SettingsSectionHeader title="SHARE HISTORY" />
      <SettingsGroup>
        <SettingsRow
          title="Share History"
          subtitle="0 cards shared"
          leading={<SettingsIconTile web="clock" color="#8E8E93" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Alert.alert("Share History", "No shares yet.");
          }}
        />
      </SettingsGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  detailText: {
    fontSize: 17,
    lineHeight: 22,
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
});
