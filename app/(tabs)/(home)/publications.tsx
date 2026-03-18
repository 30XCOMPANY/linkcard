/**
 * [INPUT]: react-native, @/src/stores/cardStore, @/src/lib/platform-color
 * [OUTPUT]: PublicationsScreen — web/Android fallback with plain RN components
 * [POS]: Push screen from editor — simple list of publications with edit/delete
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { platformColor } from "@/src/lib/platform-color";
import { useCardStore } from "@/src/stores/cardStore";

export default function PublicationsScreen() {
  const card = useCardStore((state) => state.card);
  const updateProfile = useCardStore((state) => state.updateProfile);

  const publications = card?.profile.publications ?? [];

  const handleDelete = useCallback(
    (index: number) => {
      const pubs = [...publications];
      pubs.splice(index, 1);
      updateProfile({ publications: pubs });
    },
    [publications, updateProfile]
  );

  const handleAdd = useCallback(() => {
    const title = prompt("New Publication", "Enter the title");
    if (title?.trim()) {
      updateProfile({
        publications: [...publications, { title: title.trim() }],
      });
    }
  }, [publications, updateProfile]);

  if (!card) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No card available.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      {publications.length > 0 ? (
        publications.map((pub, i) => (
          <View key={`pub-${i}`} style={styles.card}>
            <View style={styles.cardBody}>
              <Text style={styles.pubTitle}>{pub.title}</Text>
              {pub.publisher ? (
                <Text style={styles.pubSub}>{pub.publisher}</Text>
              ) : null}
              {pub.url ? (
                <Text style={styles.pubSub}>{pub.url}</Text>
              ) : null}
            </View>
            <Pressable onPress={() => handleDelete(i)} hitSlop={8}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>
          No publications yet. Tap Add to create one.
        </Text>
      )}

      <Pressable style={styles.addBtn} onPress={handleAdd}>
        <Text style={styles.addBtnText}>Add Publication</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
  },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyText: {
    color: platformColor("secondaryLabel"),
    fontSize: 15,
  },
  card: {
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  pubTitle: {
    color: platformColor("label"),
    fontSize: 17,
    fontWeight: "600",
  },
  pubSub: {
    color: platformColor("secondaryLabel"),
    fontSize: 14,
  },
  deleteText: {
    color: platformColor("systemRed"),
    fontSize: 15,
  },
  addBtn: {
    alignItems: "center",
    backgroundColor: platformColor("systemBlue"),
    borderRadius: 12,
    marginTop: 8,
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 12,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
