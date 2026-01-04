import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Share as RNShare,
  Platform,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Design System
import { Box, VStack, HStack, Text } from '@/src/design-system/primitives';
import { GlassCard, GlassButton } from '@/src/design-system/patterns';
import { GlassScreenLayout } from '@/src/design-system/layouts';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import { shadows } from '@/src/design-system/tokens/shadows';

import { BusinessCard } from '@/src/components/cards';
import { useCardStore } from '@/src/stores/cardStore';
import { CardVersion } from '@/src/types';

export default function ShareScreen() {
  const { card, accentColor, currentGradient } = useCardStore();

  const [selectedVersion, setSelectedVersion] = useState<CardVersion | null>(
    card?.versions.find((v: CardVersion) => v.isDefault) || card?.versions[0] || null
  );
  const [selectedFields, setSelectedFields] = useState<string[]>(
    selectedVersion?.visibleFields || []
  );

  // Dynamic text color based on background
  const isDarkBackground = useMemo(() => {
    return ['black', 'ocean', 'purple', 'sunset', 'midnight'].includes(currentGradient);
  }, [currentGradient]);

  const secondaryTextColor = isDarkBackground ? 'rgba(255, 255, 255, 0.7)' : colors.textMuted;

  if (!card) {
    return null;
  }

  const toggleField = (field: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      const shareUrl = `https://linkcard.app/c/${card.id}?v=${selectedVersion?.id}`;
      await RNShare.share({
        title: `${card.profile.name}'s Business Card`,
        message: `Connect with ${card.profile.name}: ${shareUrl}`,
        url: shareUrl,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleCopyLink = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // In production, copy to clipboard
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
    <GlassScreenLayout title="Smart Share" backIcon="close">
      {/* Card Preview */}
      <Animated.View entering={FadeInUp.delay(200).springify()}>
        <VStack gap="md" style={{ marginBottom: spacing['2xl'] }}>
          <Text variant="label" weight="semibold" style={{ color: secondaryTextColor, fontSize: 13 }}>
            PREVIEW
          </Text>
          {selectedVersion && (
            <BusinessCard
              profile={card.profile}
              version={{ ...selectedVersion, visibleFields: selectedFields as any }}
              qrCodeData={card.qrCodeData}
            />
          )}
        </VStack>
      </Animated.View>

      {/* Version Selector */}
      <Animated.View entering={FadeInUp.delay(250).springify()}>
        <VStack gap="md" style={{ marginBottom: spacing['2xl'] }}>
          <Text variant="label" weight="semibold" style={{ color: secondaryTextColor, fontSize: 13 }}>
            CARD STYLE
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm }}
          >
            {card.versions.map((version: CardVersion) => {
              const isSelected = selectedVersion?.id === version.id;
              return (
                <TouchableOpacity
                  key={version.id}
                  onPress={() => {
                    setSelectedVersion(version);
                    setSelectedFields(version.visibleFields);
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Box
                    px="lg"
                    py="md"
                    borderRadius="pill"
                    style={{
                      backgroundColor: isSelected ? colors.white : 'rgba(255, 255, 255, 0.8)',
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? version.accentColor : 'rgba(255, 255, 255, 1)',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.sm,
                      ...shadows.sm,
                    }}
                  >
                    <Box
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: version.accentColor,
                      }}
                    />
                    <Text
                      variant="body"
                      weight={isSelected ? 'semibold' : 'medium'}
                      style={{ fontSize: 14 }}
                    >
                      {version.name}
                    </Text>
                  </Box>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </VStack>
      </Animated.View>

      {/* Field Selector */}
      <Animated.View entering={FadeInUp.delay(300).springify()}>
        <VStack gap="md" style={{ marginBottom: spacing['2xl'] }}>
          <VStack gap="xs">
            <Text variant="label" weight="semibold" style={{ color: secondaryTextColor, fontSize: 13 }}>
              WHAT TO SHARE
            </Text>
            <Text variant="caption" color="textMuted">
              Choose which information to include
            </Text>
          </VStack>

          <GlassCard padding="lg" borderRadius="xl">
            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {availableFields.map((field) => {
                const isSelected = selectedFields.includes(field.key);
                return (
                  <TouchableOpacity
                    key={field.key}
                    onPress={() => toggleField(field.key)}
                    activeOpacity={0.7}
                  >
                    <Box
                      px="md"
                      py="sm"
                      borderRadius="md"
                      style={{
                        backgroundColor: isSelected
                          ? `${accentColor}20`
                          : 'rgba(255, 255, 255, 0.5)',
                        borderWidth: isSelected ? 1.5 : 1,
                        borderColor: isSelected ? accentColor : 'rgba(0, 0, 0, 0.1)',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.xs,
                      }}
                    >
                      <Ionicons
                        name={field.icon as any}
                        size={16}
                        color={isSelected ? accentColor : colors.textMuted}
                      />
                      <Text
                        variant="caption"
                        weight={isSelected ? 'semibold' : 'medium'}
                        style={{
                          color: isSelected ? accentColor : colors.text,
                          fontSize: 13,
                        }}
                      >
                        {field.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={14} color={accentColor} />
                      )}
                    </Box>
                  </TouchableOpacity>
                );
              })}
            </Box>
          </GlassCard>
        </VStack>
      </Animated.View>

      {/* Share Actions */}
      <Animated.View entering={FadeInUp.delay(350).springify()}>
        <VStack gap="md">
          <Text variant="label" weight="semibold" style={{ color: secondaryTextColor, fontSize: 13 }}>
            QUICK ACTIONS
          </Text>
          <HStack gap="md" style={{ justifyContent: 'center' }}>
            <TouchableOpacity
              onPress={handleCopyLink}
              activeOpacity={0.7}
            >
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadows.md,
                }}
              >
                <Ionicons name="link-outline" size={24} color={colors.dark} />
              </Box>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { }}
              activeOpacity={0.7}
            >
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadows.md,
                }}
              >
                <Ionicons name="radio-outline" size={24} color={colors.dark} />
              </Box>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { }}
              activeOpacity={0.7}
            >
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.dark,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadows.md,
                }}
              >
                <Ionicons name="wallet-outline" size={24} color={colors.white} />
              </Box>
            </TouchableOpacity>
          </HStack>

          <GlassButton
            onPress={handleShare}
            variant="primary"
            style={{ marginTop: spacing.md }}
          >
            <HStack gap="sm" align="center" style={{ justifyContent: 'center' }}>
              <Ionicons name="share-outline" size={20} color={colors.dark} />
              <Text variant="button" weight="semibold">
                Share Card
              </Text>
            </HStack>
          </GlassButton>
        </VStack>
      </Animated.View>
    </GlassScreenLayout>
  );
}
