/**
 * [INPUT]: react-native Linking/Alert/Clipboard
 * [OUTPUT]: executeContactAction — opens contact channel based on action type
 * [POS]: Shared utility — used by discover screen and card holder
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Alert, Clipboard, Linking } from "react-native";
import type { ContactAction } from "@/src/types";

export function executeContactAction(
  action?: ContactAction,
  fallbackUrl?: string
) {
  if (!action) {
    if (fallbackUrl) Linking.openURL(fallbackUrl);
    return;
  }
  switch (action.type) {
    case "email":
      Linking.openURL(`mailto:${action.value}`);
      break;
    case "linkedin":
    case "url":
      Linking.openURL(action.value);
      break;
    case "wechat":
      Alert.alert("WeChat ID", action.value, [
        {
          text: "Copy",
          onPress: () => Clipboard.setString(action.value),
        },
        { text: "OK" },
      ]);
      break;
  }
}
