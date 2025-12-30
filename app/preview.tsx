import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components/ui';
import { BusinessCard } from '@/src/components/cards';
import { getTheme, spacing, typography, radius, shadows } from '@/src/constants/theme';
import * as Haptics from 'expo-haptics';
import { LinkedInProfile, CardVersion } from '@/src/types';

// Mock LinkedIn data - in production, this would come from your API
const mockLinkedInData: LinkedInProfile = {
  name: 'John Doe',
  headline: 'Senior Software Engineer at Tech Corp',
  company: 'Tech Corp',
  location: 'San Francisco, CA',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  website: 'https://johndoe.com',
  photoUrl: 'https://via.placeholder.com/200',
  linkedinUrl: 'https://linkedin.com/in/johndoe',
};

const defaultVersion: CardVersion = {
  id: 'default',
  name: 'Default',
  template: 'classic',
  accentColor: '#1A1A1A',
  isDefault: true,
  visibleFields: ['name', 'headline', 'company', 'location', 'email', 'phone', 'website', 'qrCode'],
};

export default function PreviewScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getTheme('light', colorScheme || 'light');
  const params = useLocalSearchParams();
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch LinkedIn data from API
    const fetchProfile = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(mockLinkedInData);
      setLoading(false);
    };

    fetchProfile();
  }, [params.linkedinUrl]);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/editor');
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/editor');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading your profile...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Failed to load profile
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={[styles.backButton, { backgroundColor: theme.colors.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Profile Preview
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text },
            ]}
          >
            Your LinkedIn Profile
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            We've imported the following information from your LinkedIn profile
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View
            style={[
              styles.cardPreview,
              { backgroundColor: theme.colors.card },
              shadows.md,
            ]}
          >
            <BusinessCard
              profile={profile}
              version={defaultVersion}
              qrCodeData={`https://linkcard.app/${profile.name.toLowerCase().replace(/\s+/g, '-')}`}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <View
            style={[
              styles.dataCard,
              { backgroundColor: theme.colors.card },
              shadows.sm,
            ]}
          >
            <Text
              style={[
                styles.dataTitle,
                { color: theme.colors.text },
              ]}
            >
              Imported Data
            </Text>
            <View style={styles.dataList}>
              {profile.name && (
                <View style={styles.dataItem}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
                  <Text style={[styles.dataLabel, { color: theme.colors.text }]}>Name</Text>
                  <Text style={[styles.dataValue, { color: theme.colors.textSecondary }]}>
                    {profile.name}
                  </Text>
                </View>
              )}
              {profile.headline && (
                <View style={styles.dataItem}>
                  <Ionicons name="briefcase-outline" size={20} color={theme.colors.textSecondary} />
                  <Text style={[styles.dataLabel, { color: theme.colors.text }]}>Headline</Text>
                  <Text style={[styles.dataValue, { color: theme.colors.textSecondary }]}>
                    {profile.headline}
                  </Text>
                </View>
              )}
              {profile.company && (
                <View style={styles.dataItem}>
                  <Ionicons name="business-outline" size={20} color={theme.colors.textSecondary} />
                  <Text style={[styles.dataLabel, { color: theme.colors.text }]}>Company</Text>
                  <Text style={[styles.dataValue, { color: theme.colors.textSecondary }]}>
                    {profile.company}
                  </Text>
                </View>
              )}
              {profile.location && (
                <View style={styles.dataItem}>
                  <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} />
                  <Text style={[styles.dataLabel, { color: theme.colors.text }]}>Location</Text>
                  <Text style={[styles.dataValue, { color: theme.colors.textSecondary }]}>
                    {profile.location}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.delay(400).springify()}
        style={[styles.footer, { backgroundColor: theme.colors.background }]}
      >
        <Button
          onPress={handleContinue}
          variant="primary"
          size="lg"
          fullWidth
          icon={<Ionicons name="create-outline" size={20} color={theme.colors.foreground} />}
        >
          Customize Your Card
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
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.xl,
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
    fontFamily: typography.fontFamily.displayMedium,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  sectionTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.display,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    marginBottom: spacing['2xl'],
  },
  cardPreview: {
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  dataCard: {
    borderRadius: radius.lg,
    padding: spacing['2xl'],
  },
  dataTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.displayMedium,
    marginBottom: spacing.lg,
  },
  dataList: {
    gap: spacing.lg,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dataLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemibold,
    minWidth: 80,
  },
  dataValue: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
  },
  footer: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    textAlign: 'center',
    color: '#EF4444',
  },
});

