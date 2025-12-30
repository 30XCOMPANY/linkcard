import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BusinessCard } from '@/src/components/cards';
import { Button } from '@/src/components/ui';
import { useCardStore } from '@/src/stores/cardStore';
import { CardVersion, CardTemplate } from '@/src/types';
import { getTheme, spacing, typography, radius, shadows, accentColors, AccentColorKey } from '@/src/constants/theme';

export default function VersionsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { card, themeMode, accentColor, addVersion, updateVersion, deleteVersion, setDefaultVersion } = useCardStore();
  const theme = getTheme(themeMode, colorScheme || 'light');

  const [selectedVersion, setSelectedVersion] = useState<CardVersion | null>(
    card?.versions[0] || null
  );

  if (!card) {
    return null;
  }

  const handleSelectVersion = (version: CardVersion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedVersion(version);
  };

  const handleSetDefault = (version: CardVersion) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDefaultVersion(version.id);
  };

  const handleDeleteVersion = (version: CardVersion) => {
    if (card.versions.length <= 1) {
      Alert.alert('Cannot Delete', 'You must have at least one card version.');
      return;
    }

    Alert.alert(
      'Delete Version',
      `Are you sure you want to delete "${version.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteVersion(version.id);
            if (selectedVersion?.id === version.id) {
              setSelectedVersion(card.versions.filter((v: CardVersion) => v.id !== version.id)[0]);
            }
          },
        },
      ]
    );
  };

  const handleAddVersion = () => {
    const newVersion: CardVersion = {
      id: `version-${Date.now()}`,
      name: `Custom ${card.versions.length + 1}`,
      visibleFields: ['name', 'headline', 'company', 'qrCode'],
      template: 'modern',
      accentColor: accentColors.violet,
      isDefault: false,
    };
    addVersion(newVersion);
    setSelectedVersion(newVersion);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.colors.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Card Versions
        </Text>
        <TouchableOpacity
          onPress={handleAddVersion}
          style={[styles.addButton, { backgroundColor: accentColor }]}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Preview */}
        {selectedVersion && (
          <Animated.View entering={FadeInUp.springify()}>
            <BusinessCard
              profile={card.profile}
              version={selectedVersion}
              qrCodeData={card.qrCodeData}
            />
          </Animated.View>
        )}

        {/* Version List */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.versionList}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Your Versions
          </Text>

          {card.versions.map((version: CardVersion, index: number) => (
            <Animated.View
              key={version.id}
              entering={FadeInDown.delay(300 + index * 100).springify()}
              layout={Layout.springify()}
            >
              <TouchableOpacity
                onPress={() => handleSelectVersion(version)}
                style={[
                  styles.versionCard,
                  { backgroundColor: theme.colors.card },
                  selectedVersion?.id === version.id && {
                    borderColor: version.accentColor,
                    borderWidth: 2,
                  },
                  shadows.sm,
                ]}
              >
                <View style={styles.versionHeader}>
                  <View
                    style={[
                      styles.versionColor,
                      { backgroundColor: version.accentColor },
                    ]}
                  />
                  <View style={styles.versionInfo}>
                    <Text style={[styles.versionName, { color: theme.colors.text }]}>
                      {version.name}
                    </Text>
                    <Text style={[styles.versionTemplate, { color: theme.colors.textSecondary }]}>
                      {version.template.charAt(0).toUpperCase() + version.template.slice(1)} • {version.visibleFields.length} fields
                    </Text>
                  </View>
                  {version.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: `${accentColor}20` }]}>
                      <Text style={[styles.defaultText, { color: accentColor }]}>
                        Default
                      </Text>
                    </View>
                  )}
                </View>

                {selectedVersion?.id === version.id && (
                  <View style={styles.versionActions}>
                    {!version.isDefault && (
                      <TouchableOpacity
                        onPress={() => handleSetDefault(version)}
                        style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
                      >
                        <Ionicons name="star-outline" size={18} color={theme.colors.text} />
                        <Text style={[styles.actionText, { color: theme.colors.text }]}>
                          Set Default
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleDeleteVersion(version)}
                      style={[styles.actionButton, { backgroundColor: '#FEE2E2' }]}
                    >
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Tips */}
        <Animated.View
          entering={FadeInDown.delay(500).springify()}
          style={[styles.tipsCard, { backgroundColor: `${accentColor}10` }]}
        >
          <Ionicons name="bulb-outline" size={20} color={accentColor} />
          <Text style={[styles.tipsText, { color: theme.colors.text }]}>
            Create different versions for different contexts - use "Professional" for business meetings and "Networking" for casual events.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  versionList: {
    marginTop: spacing['2xl'],
  },
  versionCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  versionInfo: {
    flex: 1,
  },
  versionName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  versionTemplate: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  defaultBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  defaultText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  versionActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  tipsText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * 1.5,
  },
});


