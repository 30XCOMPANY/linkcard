/**
 * [INPUT]: react-native View/Text/Pressable/PlatformColor/StyleSheet/ScrollView,
 *          @/src/stores/contactsStore, @/src/components/shared/avatar Avatar,
 *          @/src/components/card/profile-card ProfileCard,
 *          @/src/design-system/settings primitives,
 *          @/src/lib/haptics, @/src/lib/contact-actions, @/src/types
 * [OUTPUT]: CollectionScreen — saved cards list with expandable detail and discover return path
 * [POS]: Discover sub-screen — saved contact library for the swipe flow
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

import { useContactsStore } from "@/src/stores/contactsStore";
import { Avatar } from "@/src/components/shared/avatar";
import { ProfileCard } from "@/src/components/card/profile-card";
import { executeContactAction } from "@/src/lib/contact-actions";
import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";
import { springs } from "@/src/lib/springs";
import {
  SettingsGroup,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
} from "@/src/design-system/settings";
import type { CardVersion, SavedContact } from "@/src/types";

function ContactRow({
  contact,
  isLast,
  expanded,
  onPress,
  onSayHi,
  onDelete,
}: {
  contact: SavedContact;
  isLast: boolean;
  expanded: boolean;
  onPress: () => void;
  onSayHi: () => void;
  onDelete: () => void;
}) {
  // Build a CardVersion for display
  const version: CardVersion = {
    id: "collection-preview",
    name: contact.profile.name,
    visibleFields: ["photoUrl", "name", "headline", "company", "location", "character", "qrCode"],
    template: "modern",
    accentColor: "#007AFF",
    background: "lightGlass",
    isDefault: false,
  };

  return (
    <>
      <SettingsRow
        title={contact.profile.name}
        subtitle={contact.profile.headline}
        leading={
          <Avatar
            source={contact.profile.photoUrl}
            name={contact.profile.name}
            size={36}
          />
        }
        trailing={
          <Text style={styles.rowActionLabel}>
            {expanded ? "Hide" : "Show"}
          </Text>
        }
        onPress={onPress}
      />
      {expanded ? (
        <Animated.View
          entering={FadeInDown.springify()
            .stiffness(springs.gentle.stiffness)
            .damping(springs.gentle.damping)}
          exiting={FadeOutUp.duration(150)}
          style={styles.detail}
        >
          <ProfileCard
            profile={contact.profile}
            version={version}
          />
          <View style={styles.detailActions}>
            <Pressable style={styles.detailBtnPrimary} onPress={onSayHi}>
              <Text style={styles.detailBtnPrimaryLabel}>
                {contact.contactAction?.label ?? "Say Hi"}
              </Text>
            </Pressable>
            <Pressable style={styles.detailBtnDestructive} onPress={onDelete}>
              <Text style={styles.detailBtnDestructiveLabel}>Remove</Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : null}
      {!isLast ? <SettingsSeparator inset={68} /> : null}
    </>
  );
}

export default function CollectionScreen() {
  const router = useRouter();
  const savedContacts = useContactsStore((s) => s.savedContacts);
  const removeContact = useContactsStore((s) => s.removeContact);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = useCallback(
    (id: string) => {
      haptic.light();
      setExpandedId((prev) => (prev === id ? null : id));
    },
    []
  );

  const handleSayHi = useCallback((contact: SavedContact) => {
    haptic.medium();
    executeContactAction(contact.contactAction, contact.profile.url);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      haptic.warning();
      removeContact(id);
      if (expandedId === id) setExpandedId(null);
    },
    [removeContact, expandedId]
  );

  if (savedContacts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No saved cards yet</Text>
        <Text style={styles.emptySubtitle}>
          Browse Discover to find and save interesting people
        </Text>
        <Pressable style={styles.emptyButton} onPress={() => router.back()}>
          <Text style={styles.emptyButtonLabel}>Back to Discover</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <SettingsSectionHeader title={`${savedContacts.length} SAVED CARDS`} />
      <SettingsGroup>
        {savedContacts.map((contact, i) => (
          <ContactRow
            key={contact.id}
            contact={contact}
            isLast={i === savedContacts.length - 1}
            expanded={expandedId === contact.id}
            onPress={() => handleToggle(contact.id)}
            onSayHi={() => handleSayHi(contact)}
            onDelete={() => handleDelete(contact.id)}
          />
        ))}
      </SettingsGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: platformColor("label"),
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 20,
    color: platformColor("secondaryLabel"),
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 20,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderCurve: "continuous" as any,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyButtonLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  rowActionLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: "#007AFF",
  },
  detail: {
    padding: 16,
  },
  detailActions: {
    marginTop: 16,
    gap: 8,
  },
  detailBtnPrimary: {
    minHeight: 44,
    borderRadius: 22,
    borderCurve: "continuous" as any,
    backgroundColor: platformColor("systemBlue"),
    alignItems: "center",
    justifyContent: "center",
  },
  detailBtnPrimaryLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  detailBtnDestructive: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  detailBtnDestructiveLabel: {
    fontSize: 15,
    lineHeight: 20,
    color: platformColor("systemRed"),
  },
});
