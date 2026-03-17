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
      <NativeTabs.Trigger name="(index,share)" href="/">
        <NativeTabs.Trigger.TabBarIcon
          ios={{ default: "person.crop.rectangle", selected: "person.crop.rectangle.fill" }}
          androidIconName="person"
        />
        <NativeTabs.Trigger.TabBarLabel>Card</NativeTabs.Trigger.TabBarLabel>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(index,share)" segment="share" href="/share">
        <NativeTabs.Trigger.TabBarIcon
          ios={{ default: "square.and.arrow.up", selected: "square.and.arrow.up.fill" }}
          androidIconName="share"
        />
        <NativeTabs.Trigger.TabBarLabel>Share</NativeTabs.Trigger.TabBarLabel>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.TabBarIcon
          ios={{ default: "gearshape", selected: "gearshape.fill" }}
          androidIconName="settings"
        />
        <NativeTabs.Trigger.TabBarLabel>Settings</NativeTabs.Trigger.TabBarLabel>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
