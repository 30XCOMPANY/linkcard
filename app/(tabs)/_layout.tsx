/**
 * [INPUT]: expo-router NativeTabs
 * [OUTPUT]: Tab layout with Card, Share, Settings tabs using SF Symbols
 * [POS]: Tab navigator — iOS native tabs with Liquid Glass on iOS 26+
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon sf={{ default: "rectangle.on.rectangle.angled", selected: "rectangle.fill.on.rectangle.angled.fill" }} md="card_membership" />
        <NativeTabs.Trigger.Label>Card</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(share)">
        <NativeTabs.Trigger.Icon sf={{ default: "paperplane", selected: "paperplane.fill" }} md="send" />
        <NativeTabs.Trigger.Label>Share</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(settings)">
        <NativeTabs.Trigger.Icon sf={{ default: "slider.horizontal.3", selected: "slider.horizontal.3" }} md="tune" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
