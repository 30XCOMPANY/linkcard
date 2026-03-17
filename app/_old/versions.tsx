import React, { useState, useMemo } from 'react';
import {
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Design System
import { Box, VStack, HStack, Text } from '@/src/design-system/primitives';
import { GlassCard } from '@/src/design-system/patterns';
import { GlassScreenLayout } from '@/src/design-system/layouts';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';

import { BusinessCard } from '@/src/components/cards';
import { useCardStore } from '@/src/stores/cardStore';
import { CardVersion } from '@/src/types';
import { accentColors } from '@/src/design-system/tokens/colors';

export default function VersionsScreen() {
  const { card, accentColor, currentGradient, addVersion, deleteVersion, setDefaultVersion } = useCardStore();

  const [selectedVersion, setSelectedVersion] = useState<CardVersion | null>(
    card?.versions[0] || null
  );

  // Dynamic text color based on background
  const isDarkBackground = useMemo(() => {
    return ['black', 'ocean', 'purple', 'sunset', 'midnight'].includes(currentGradient);
  }, [currentGradient]);

  const secondaryTextColor = isDarkBackground ? 'rgba(255, 255, 255, 0.7)' : colors.textMuted;

  if (!card) {
    return null;
  }

  const handleSelectVersion = (version: CardVersion) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedVersion(version);
  };

  const handleSetDefault = (version: CardVersion) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
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
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const addButton = (
    <TouchableOpacity
      onPress={handleAddVersion}
      style={{ width: 40, height: 40, backgroundColor: accentColor, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Ionicons name="add" size={24} color={colors.white} />
    </TouchableOpacity>
  );

  return (
    <GlassScreenLayout title="Card Versions" rightElement={addButton}>
      {/* Card Preview */}
      {selectedVersion && (
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <VStack gap="md" style={{ marginBottom: spacing['2xl'] }}>
            <Text variant="label" weight="semibold" style={{ color: secondaryTextColor, fontSize: 13 }}>
              PREVIEW
            </Text>
            <BusinessCard
              profile={card.profile}
              version={selectedVersion}
              qrCodeData={card.qrCodeData}
            />
          </VStack>
        </Animated.View>
      )}

      {/* Version List */}
      <Animated.View entering={FadeInDown.delay(250).springify()}>
        <VStack gap="md" style={{ marginBottom: spacing['2xl'] }}>
          <Text variant="label" weight="semibold" style={{ color: secondaryTextColor, fontSize: 13 }}>
            YOUR VERSIONS
          </Text>

          <VStack gap="md">
            {card.versions.map((version: CardVersion, index: number) => (
              <Animated.View
                key={version.id}
                entering={FadeInDown.delay(300 + index * 100).springify()}
                layout={Layout.springify()}
              >
                <TouchableOpacity
                  onPress={() => handleSelectVersion(version)}
                  activeOpacity={0.8}
                >
                  <GlassCard
                    padding="lg"
                    borderRadius="xl"
                    style={{
                      borderWidth: selectedVersion?.id === version.id ? 2 : 0,
                      borderColor: selectedVersion?.id === version.id ? version.accentColor : 'transparent',
                    }}
                  >
                    <VStack gap="md">
                      {/* Version Header */}
                      <HStack align="center" style={{ justifyContent: 'space-between' }}>
                        <HStack gap="md" align="center" style={{ flex: 1 }}>
                          <Box
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 6,
                              backgroundColor: version.accentColor,
                            }}
                          />
                          <VStack gap="xs" style={{ flex: 1 }}>
                            <Text variant="body" weight="semibold">
                              {version.name}
                            </Text>
                            <Text variant="caption" color="textMuted">
                              {version.template.charAt(0).toUpperCase() + version.template.slice(1)} • {version.visibleFields.length} fields
                            </Text>
                          </VStack>
                        </HStack>
                        {version.isDefault && (
                          <Box
                            px="md"
                            py="xs"
                            borderRadius="pill"
                            style={{ backgroundColor: `${accentColor}20` }}
                          >
                            <Text variant="caption" weight="semibold" style={{ color: accentColor, fontSize: 11 }}>
                              Default
                            </Text>
                          </Box>
                        )}
                      </HStack>

                      {/* Version Actions (shown when selected) */}
                      {selectedVersion?.id === version.id && (
                        <Animated.View entering={FadeInDown.springify()}>
                          <Box style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.06)', marginVertical: spacing.xs }} />
                          <HStack gap="sm">
                            {!version.isDefault && (
                              <TouchableOpacity
                                onPress={() => handleSetDefault(version)}
                                style={{ flex: 1 }}
                                activeOpacity={0.7}
                              >
                                <Box
                                  px="md"
                                  py="sm"
                                  borderRadius="md"
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: spacing.xs,
                                  }}
                                >
                                  <Ionicons name="star-outline" size={16} color={colors.text} />
                                  <Text variant="caption" weight="medium">
                                    Set Default
                                  </Text>
                                </Box>
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              onPress={() => handleDeleteVersion(version)}
                              activeOpacity={0.7}
                            >
                              <Box
                                px="md"
                                py="sm"
                                borderRadius="md"
                                style={{
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Ionicons name="trash-outline" size={16} color={colors.error} />
                              </Box>
                            </TouchableOpacity>
                          </HStack>
                        </Animated.View>
                      )}
                    </VStack>
                  </GlassCard>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </VStack>
        </VStack>
      </Animated.View>

      {/* Tips */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <GlassCard
          padding="lg"
          borderRadius="xl"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <HStack gap="md" align="flex-start">
            <Ionicons name="bulb-outline" size={20} color={accentColor} />
            <Text variant="caption" style={{ flex: 1, lineHeight: 20 }}>
              Create different versions for different contexts - use "Professional" for business meetings and "Networking" for casual events.
            </Text>
          </HStack>
        </GlassCard>
      </Animated.View>
    </GlassScreenLayout>
  );
}
