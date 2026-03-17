/**
 * [INPUT]: expo-router NativeTabs, Majesticons tab icon PNGs
 * [OUTPUT]: Tab layout with Card, Discover, Events, Settings tabs using Majesticons
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

      <NativeTabs.Trigger name="(discover)">
        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/tab-tickets.png")}
          renderingMode="template"
        />
        <NativeTabs.Trigger.Label hidden>Discover</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(events)">
        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/tab-calendar.png")}
          renderingMode="template"
        />
        <NativeTabs.Trigger.Label hidden>Events</NativeTabs.Trigger.Label>
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
