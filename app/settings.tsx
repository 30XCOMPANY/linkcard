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
import { getTheme, spacing, typography, radius, shadows, accentColors, AccentColorKey } from '@/src/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { 
    themeMode, 
    setThemeMode, 
    accentColor, 
    setAccentColor,
    clearCard,
  } = useCardStore();
  const theme = getTheme(themeMode, colorScheme || 'light');

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(mode);
  };

  const handleColorChange = (colorKey: AccentColorKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAccentColor(colorKey);
  };

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
          Settings
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Appearance
          </Text>

          <View style={[styles.card, { backgroundColor: theme.colors.card }, shadows.sm]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Theme</Text>
            <View style={styles.themeOptions}>
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => handleThemeChange(mode)}
                  style={[
                    styles.themeOption,
                    { backgroundColor: theme.colors.surface },
                    themeMode === mode && { 
                      backgroundColor: `${accentColor}20`,
                      borderColor: accentColor,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      mode === 'light' 
                        ? 'sunny-outline' 
                        : mode === 'dark' 
                          ? 'moon-outline' 
                          : 'phone-portrait-outline'
                    }
                    size={20}
                    color={themeMode === mode ? accentColor : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.themeOptionText,
                      { color: themeMode === mode ? accentColor : theme.colors.text },
                    ]}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.card }, shadows.sm]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Accent Color</Text>
            <View style={styles.colorGrid}>
              {(Object.keys(accentColors) as AccentColorKey[]).map((colorKey) => (
                <TouchableOpacity
                  key={colorKey}
                  onPress={() => handleColorChange(colorKey)}
                  style={[
                    styles.colorOption,
                    { backgroundColor: accentColors[colorKey] },
                    accentColor === accentColors[colorKey] && styles.colorOptionSelected,
                  ]}
                >
                  {accentColor === accentColors[colorKey] && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Sync Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Sync
          </Text>

          <View style={[styles.card, { backgroundColor: theme.colors.card }, shadows.sm]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Auto-sync LinkedIn
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Automatically check for profile changes
                </Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: theme.colors.border, true: accentColor }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Sync Now
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Manually refresh your LinkedIn data
                </Text>
              </View>
              <Ionicons name="refresh-outline" size={22} color={accentColor} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Data
          </Text>

          <View style={[styles.card, { backgroundColor: theme.colors.card }, shadows.sm]}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={handleResetCard}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: '#EF4444' }]}>
                  Reset Card
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Delete your card and start fresh
                </Text>
              </View>
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <View style={styles.about}>
            <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
              LinkCard v1.0.0
            </Text>
            <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
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


