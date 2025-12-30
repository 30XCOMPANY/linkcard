import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CardCarousel } from '@/src/components/cards';
import { BusinessCard } from '@/src/components/cards/BusinessCard';
import { Button, FloatingView } from '@/src/components/ui';
import { useCardStore } from '@/src/stores/cardStore';
import { getTheme, spacing, typography, radius, shadows } from '@/src/constants/theme';
import { shareCardImage, saveCardToGallery } from '@/src/services/cardExport';
import { initializeOfflineManager, getIsOnline, addConnectionListener } from '@/src/services/offline';
import { registerBackgroundSync, setProfileForSync } from '@/src/services/backgroundSync';
import { registerForPushNotifications } from '@/src/services/notifications';
import { CardVersion } from '@/src/types';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { card, themeMode, accentColor } = useCardStore();
  const theme = getTheme(themeMode, colorScheme || 'light');
  const cardRef = useRef<View>(null);
  const [isOnline, setIsOnline] = useState(getIsOnline());
  const [isExporting, setIsExporting] = useState(false);

  // Initialize services
  useEffect(() => {
    // Don't initialize if no card
    if (!card) return;
    // Initialize offline manager
    const unsubscribe = initializeOfflineManager();

    // Listen for connection changes
    const removeListener = addConnectionListener(setIsOnline);

    // Register background sync
    registerBackgroundSync();

    // Register for push notifications
    registerForPushNotifications();

    // Store profile for background sync
    if (card?.profile) {
      setProfileForSync(card.profile);
    }

    return () => {
      unsubscribe();
      removeListener();
    };
  }, [card?.profile]);

  // If no card exists, redirect to onboarding (after all hooks)
  if (!card) {
    return <Redirect href="/onboarding" />;
  }

  const defaultVersion = card.versions.find((v: CardVersion) => v.isDefault) || card.versions[0];

  const handleExportImage = async () => {
    if (!cardRef.current) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsExporting(true);

    Alert.alert(
      'Export Card',
      'How would you like to export your card?',
      [
        {
          text: 'Share',
          onPress: async () => {
            await shareCardImage(cardRef, `${card.profile.name}'s Card`);
            setIsExporting(false);
          },
        },
        {
          text: 'Save to Photos',
          onPress: async () => {
            await saveCardToGallery(cardRef);
            setIsExporting(false);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setIsExporting(false),
        },
      ]
    );
  };

  const handleAddMoreCards = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/onboarding?step=linkedin');
  };

  const handleEditCard = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/editor');
  };

  const handleBackToSetup = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/onboarding?step=linkedin');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Offline Indicator */}
      {!isOnline && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.offlineBanner}
        >
          <Ionicons name="cloud-offline-outline" size={16} color="#FFFFFF" />
          <Text style={styles.offlineText}>You're offline. Changes will sync when connected.</Text>
        </Animated.View>
      )}

      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.header}
      >
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            Your card
          </Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {card.profile.name}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: theme.colors.card }]}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Card Carousel */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <View ref={cardRef} collapsable={false}>
            <CardCarousel
              profile={card.profile}
              versions={card.versions}
              qrCodeData={card.qrCodeData}
            />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          style={styles.actions}
        >
          <Button
            onPress={() => router.push('/share')}
            variant="primary"
            size="lg"
            fullWidth
            icon={<Ionicons name="share-outline" size={20} color="#000000" style={{ marginRight: 8 }} />}
          >
            Share Card
          </Button>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.card }, shadows.md]}
              onPress={handleEditCard}
            >
              <View style={[styles.actionIcon, { backgroundColor: accentColor }]}>
                <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Edit Card
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.card }, shadows.md]}
              onPress={() => router.push('/versions')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#6366F1' }]}>
                <Ionicons name="layers-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Versions
              </Text>
            </TouchableOpacity>
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: theme.colors.card }, shadows.sm]}
            onPress={handleExportImage}
            disabled={isExporting}
          >
            <Ionicons
              name="image-outline"
              size={20}
              color={isExporting ? theme.colors.textSecondary : theme.colors.text}
            />
            <Text style={[
              styles.exportText,
              { color: isExporting ? theme.colors.textSecondary : theme.colors.text }
            ]}>
              {isExporting ? 'Exporting...' : 'Export as Image'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Sync Status */}
        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={[styles.syncCard, { backgroundColor: theme.colors.card }, shadows.sm]}
        >
          <View style={styles.syncInfo}>
            <View style={[styles.syncDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
            <Text style={[styles.syncText, { color: theme.colors.textSecondary }]}>
              {isOnline ? 'Synced with LinkedIn' : 'Offline mode'}
            </Text>
          </View>
          <Text style={[styles.syncTime, { color: theme.colors.textSecondary }]}>
            Last updated: {formatDate(card.profile.lastSynced)}
          </Text>
        </Animated.View>

        {/* Navigation Options */}
        <Animated.View
          entering={FadeInUp.delay(500).springify()}
          style={styles.navigationSection}
        >
          <TouchableOpacity
            style={[styles.navigationButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, shadows.sm]}
            onPress={handleAddMoreCards}
          >
            <Ionicons name="add-circle-outline" size={22} color={theme.colors.text} />
            <Text style={[styles.navigationButtonText, { color: theme.colors.text }]}>
              Add More Cards
            </Text>
            <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navigationButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, shadows.sm]}
            onPress={handleBackToSetup}
          >
            <Ionicons name="arrow-back-outline" size={22} color={theme.colors.text} />
            <Text style={[styles.navigationButtonText, { color: theme.colors.text }]}>
              Back to Setup
            </Text>
            <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const formatDate = (date: Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radius.md,
    zIndex: 100,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  actions: {
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing['2xl'],
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  exportText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  syncCard: {
    marginHorizontal: spacing['2xl'],
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  syncText: {
    fontSize: typography.fontSize.sm,
  },
  syncTime: {
    fontSize: typography.fontSize.xs,
  },
  navigationSection: {
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  navigationButtonText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: '500',
  },
});

