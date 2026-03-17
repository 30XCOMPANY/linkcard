/**
 * [INPUT]: expo-router Tabs, @expo/vector-icons Ionicons
 * [OUTPUT]: Web tab layout with Ionicons
 * [POS]: Web-specific tab navigator — fallback for NativeTabs on web
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function WebTabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Card",
          tabBarIcon: ({ color }) => (
            <Ionicons name="card-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: "Share",
          tabBarIcon: ({ color }) => (
            <Ionicons name="share-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
