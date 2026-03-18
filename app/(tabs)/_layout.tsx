/**
 * [INPUT]: expo-router NativeTabs with SF Symbols
 * [OUTPUT]: Tab layout with Card, Discover, Events, Settings tabs using SF Symbols
 * [POS]: Tab navigator — iOS native tabs with Liquid Glass on iOS 26+
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon
          sf={{ default: "rectangle.on.rectangle", selected: "rectangle.on.rectangle.fill" }}
        />
        <NativeTabs.Trigger.Label hidden>Card</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(discover)">
        <NativeTabs.Trigger.Icon sf={{ default: "ticket", selected: "ticket.fill" }} />
        <NativeTabs.Trigger.Label hidden>Discover</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(events)">
        <NativeTabs.Trigger.Icon sf={{ default: "calendar", selected: "calendar.circle.fill" }} />
        <NativeTabs.Trigger.Label hidden>Events</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(settings)">
        <NativeTabs.Trigger.Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
        <NativeTabs.Trigger.Label hidden>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
