import React, { useState } from 'react';
import { TouchableOpacity, Alert, Platform } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Design System
import { Box, VStack, HStack, Text } from '@/src/design-system/primitives';
import { GlassCard, GlassToggle } from '@/src/design-system/patterns';
import { GlassScreenLayout } from '@/src/design-system/layouts';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import { useCardStore } from '@/src/stores/cardStore';

export default function SettingsScreen() {
  const { clearCard, currentGradient } = useCardStore();
  const [autoSync, setAutoSync] = useState(true);

  // Dynamic text color based on background
  const isDarkBackground = ['black', 'ocean', 'purple', 'sunset', 'midnight'].includes(currentGradient);
  const secondaryTextColor = isDarkBackground ? 'rgba(255, 255, 255, 0.7)' : colors.textMuted;

  const handleResetCard = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      'Reset Card',
      'This will delete your card and all versions. You will need to set up again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            clearCard();
            // Note: navigation will be handled by the layout component
          },
        },
      ]
    );
  };

  const handleSyncNow = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Success', 'Syncing your LinkedIn profile...');
  };

  return (
    <GlassScreenLayout title="Settings">
      {/* Sync Section */}
      <Animated.View entering={FadeInUp.delay(200).springify()}>
        <VStack gap="md" style={{ marginBottom: spacing['2xl'] }}>
          <Text variant="label" weight="semibold" style={{ color: secondaryTextColor, fontSize: 13, letterSpacing: 0.5 }}>
            SYNC
          </Text>

          <GlassCard padding="md" borderRadius="xl">
            <VStack gap="md">
              {/* Auto-sync LinkedIn */}
              <Box px="lg" py="md">
                <HStack align="center" style={{ justifyContent: 'space-between' }}>
                  <VStack gap="xs" style={{ flex: 1, paddingRight: spacing.md }}>
                    <Text variant="body" weight="medium">
                      Auto-sync LinkedIn
                    </Text>
                    <Text variant="caption" color="textMuted">
                      check for profile changes
                    </Text>
                  </VStack>
                  <GlassToggle value={autoSync} onValueChange={setAutoSync} />
                </HStack>
              </Box>

              {/* Separator */}
              <Box style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.06)', marginHorizontal: spacing.lg }} />

              {/* Sync Now */}
              <TouchableOpacity onPress={handleSyncNow} activeOpacity={0.7}>
                <Box px="lg" py="md">
                  <HStack align="center" style={{ justifyContent: 'space-between' }}>
                    <VStack gap="xs" style={{ flex: 1, paddingRight: spacing.md }}>
                      <Text variant="body" weight="medium">
                        Sync Now
                      </Text>
                      <Text variant="caption" color="textMuted">
                        refresh data manually
                      </Text>
                    </VStack>
                    <Ionicons name="refresh" size={20} color={colors.textMuted} />
                  </HStack>
                </Box>
              </TouchableOpacity>
            </VStack>
          </GlassCard>
        </VStack>
      </Animated.View>

      {/* Data Section */}
      <Animated.View entering={FadeInUp.delay(300).springify()}>
        <VStack gap="md" style={{ marginBottom: spacing['2xl'] }}>
          <Text variant="label" weight="semibold" style={{ color: secondaryTextColor, fontSize: 13, letterSpacing: 0.5 }}>
            DATA
          </Text>

          <GlassCard padding="md" borderRadius="xl">
            <TouchableOpacity onPress={handleResetCard} activeOpacity={0.7}>
              <Box px="lg" py="md">
                <HStack align="center" style={{ justifyContent: 'space-between' }}>
                  <VStack gap="xs" style={{ flex: 1, paddingRight: spacing.md }}>
                    <Text variant="body" weight="medium" style={{ color: colors.error }}>
                      Reset Card
                    </Text>
                    <Text variant="caption" color="textMuted">
                      delete card and start fresh
                    </Text>
                  </VStack>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </HStack>
              </Box>
            </TouchableOpacity>
          </GlassCard>
        </VStack>
      </Animated.View>

      {/* Footer */}
      <Animated.View entering={FadeInUp.delay(400).springify()}>
        <VStack gap="xs" align="center" style={{ marginTop: spacing.xl }}>
          <Text variant="caption" style={{ color: secondaryTextColor }}>
            LinkCard v1.0.0
          </Text>
          <Text variant="caption" style={{ color: secondaryTextColor }}>
            Made with ❤️
          </Text>
        </VStack>
      </Animated.View>
    </GlassScreenLayout>
  );
}
