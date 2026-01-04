import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  useColorScheme,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCardStore } from '@/src/stores/cardStore';
import { spacing, typography, radius, shadows } from '@/src/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { clearCard } = useCardStore();

  const handleResetCard = () => {
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
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: '#F3F4F6' }]}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#000000' }]}>
          Settings
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >


        {/* Sync Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[styles.sectionTitle, { color: '#000000' }]}>
            Sync
          </Text>

          <View style={[styles.card, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6' }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: '#000000' }]}>
                  Auto-sync LinkedIn
                </Text>
                <Text style={[styles.settingDescription, { color: '#6B7280' }]}>
                  Automatically check for profile changes
                </Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => { }}
                trackColor={{ false: '#E5E7EB', true: '#000000' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: '#E5E7EB' }]} />

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: '#000000' }]}>
                  Sync Now
                </Text>
                <Text style={[styles.settingDescription, { color: '#6B7280' }]}>
                  Manually refresh your LinkedIn data
                </Text>
              </View>
              <Ionicons name="refresh-outline" size={22} color="#000000" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={[styles.sectionTitle, { color: '#000000' }]}>
            Data
          </Text>

          <View style={[styles.card, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6' }]}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleResetCard}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: '#000000' }]}>
                  Reset Card
                </Text>
                <Text style={[styles.settingDescription, { color: '#6B7280' }]}>
                  Delete your card and start fresh
                </Text>
              </View>
              <Ionicons name="trash-outline" size={22} color="#000000" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <View style={styles.about}>
            <Text style={[styles.aboutText, { color: '#9CA3AF' }]}>
              LinkCard v1.0.0
            </Text>
            <Text style={[styles.aboutText, { color: '#9CA3AF' }]}>
              Made with ❤️
            </Text>
          </View>
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
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  themeOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  about: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
    gap: spacing.xs,
  },
  aboutText: {
    fontSize: typography.fontSize.sm,
  },
});


