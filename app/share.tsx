import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BusinessCard } from '@/src/components/cards';
import { Button } from '@/src/components/ui';
import { useCardStore } from '@/src/stores/cardStore';
import { CardVersion } from '@/src/types';
import { getTheme, spacing, typography, radius, shadows } from '@/src/constants/theme';

export default function ShareScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { card, themeMode, accentColor } = useCardStore();
  const theme = getTheme(themeMode, colorScheme || 'light');

  const [selectedVersion, setSelectedVersion] = useState<CardVersion | null>(
    card?.versions.find((v: CardVersion) => v.isDefault) || card?.versions[0] || null
  );
  const [selectedFields, setSelectedFields] = useState<string[]>(
    selectedVersion?.visibleFields || []
  );

  if (!card) {
    return null;
  }

  const toggleField = (field: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleShare = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Generate a shareable URL (in production, this would create a unique link)
      const shareUrl = `https://linkcard.app/c/${card.id}?v=${selectedVersion?.id}`;

      await Share.share({
        title: `${card.profile.name}'s Business Card`,
        message: `Connect with ${card.profile.name}: ${shareUrl}`,
        url: shareUrl,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleCopyLink = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // In production, copy to clipboard
    // Clipboard.setString(shareUrl);
  };

  const availableFields = [
    { key: 'name', label: 'Name', icon: 'person-outline' },
    { key: 'headline', label: 'Headline', icon: 'briefcase-outline' },
    { key: 'company', label: 'Company', icon: 'business-outline' },
    { key: 'location', label: 'Location', icon: 'location-outline' },
    { key: 'email', label: 'Email', icon: 'mail-outline' },
    { key: 'phone', label: 'Phone', icon: 'call-outline' },
    { key: 'website', label: 'Website', icon: 'globe-outline' },
    { key: 'qrCode', label: 'QR Code', icon: 'qr-code-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.closeButton, { backgroundColor: theme.colors.card }]}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Smart Share
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Preview */}
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Preview
          </Text>
          {selectedVersion && (
            <BusinessCard
              profile={card.profile}
              version={{ ...selectedVersion, visibleFields: selectedFields as any }}
              qrCodeData={card.qrCodeData}
            />
          )}
        </Animated.View>

        {/* Version Selector */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Card Style
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.versionList}
          >
            {card.versions.map((version: CardVersion) => (
              <TouchableOpacity
                key={version.id}
                onPress={() => {
                  setSelectedVersion(version);
                  setSelectedFields(version.visibleFields);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.versionChip,
                  { backgroundColor: theme.colors.card },
                  selectedVersion?.id === version.id && {
                    borderColor: version.accentColor,
                    borderWidth: 2,
                  },
                  shadows.sm,
                ]}
              >
                <View
                  style={[
                    styles.versionDot,
                    { backgroundColor: version.accentColor },
                  ]}
                />
                <Text
                  style={[
                    styles.versionText,
                    { color: theme.colors.text },
                    selectedVersion?.id === version.id && { fontWeight: '600' },
                  ]}
                >
                  {version.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Field Selector */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            What to share
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Choose which information to include
          </Text>

          <View style={styles.fieldGrid}>
            {availableFields.map((field) => {
              const isSelected = selectedFields.includes(field.key);
              return (
                <TouchableOpacity
                  key={field.key}
                  onPress={() => toggleField(field.key)}
                  style={[
                    styles.fieldChip,
                    { backgroundColor: theme.colors.card },
                    isSelected && { backgroundColor: `${accentColor}15` },
                    shadows.sm,
                  ]}
                >
                  <Ionicons
                    name={field.icon as any}
                    size={18}
                    color={isSelected ? accentColor : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.fieldText,
                      { color: isSelected ? accentColor : theme.colors.text },
                      isSelected && { fontWeight: '600' },
                    ]}
                  >
                    {field.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={16} color={accentColor} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Share Actions */}
      <Animated.View
        entering={FadeInUp.delay(400).springify()}
        style={[styles.footer, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.shareActions}>
          <TouchableOpacity
            style={[styles.shareOption, { backgroundColor: theme.colors.card }, shadows.sm]}
            onPress={handleCopyLink}
          >
            <Ionicons name="link-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareOption, { backgroundColor: theme.colors.card }, shadows.sm]}
            onPress={() => {/* AirDrop */ }}
          >
            <Ionicons name="radio-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareOption, { backgroundColor: '#000000' }, shadows.sm]}
            onPress={() => {/* Add to Wallet */ }}
          >
            <Ionicons name="wallet-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Button
          onPress={handleShare}
          variant="primary"
          size="lg"
          fullWidth
          icon={<Ionicons name="share-outline" size={20} color="#000000" style={{ marginRight: 8 }} />}
        >
          Share Card
        </Button>
      </Animated.View>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  closeButton: {
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
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
  section: {
    marginTop: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  versionList: {
    gap: spacing.md,
  },
  versionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  versionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  versionText: {
    fontSize: typography.fontSize.sm,
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  fieldChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  fieldText: {
    fontSize: typography.fontSize.sm,
  },
  footer: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.lg,
  },
  shareActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  shareOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


