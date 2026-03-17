/**
 * [INPUT]: expo-router NativeTabs, Majesticons tab icon PNGs
 * [OUTPUT]: Tab layout with Card, Share, Settings tabs using Majesticons
 * [POS]: Tab navigator — iOS native tabs with Liquid Glass on iOS 26+
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/tab-creditcard.png")}
          renderingMode="template"
        />
        <NativeTabs.Trigger.Label hidden>Card</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(share)">
        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/tab-send.png")}
          renderingMode="template"
        />
        <NativeTabs.Trigger.Label hidden>Share</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(settings)">
        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/tab-settings-cog.png")}
          renderingMode="template"
        />
        <NativeTabs.Trigger.Label hidden>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
