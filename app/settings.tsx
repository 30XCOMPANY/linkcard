import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCardStore } from '@/src/stores/cardStore';
import * as Haptics from 'expo-haptics';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Custom Switch - Black & White
const CustomSwitch = ({ value, onValueChange }: { value: boolean; onValueChange: (val: boolean) => void }) => {
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onValueChange(!value);
  };

  return (
    <Pressable
      onPress={toggle}
      style={[
        styles.switchTrack,
        { backgroundColor: value ? '#000000' : '#E5E5EA' } // Use system gray for off state
      ]}
    >
      <View
        style={[
          styles.switchThumb,
          {
            transform: [{ translateX: value ? 20 : 0 }],
          }
        ]}
      />
    </Pressable>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const { clearCard } = useCardStore();
  const [autoSync, setAutoSync] = React.useState(true);

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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header - Transparent & Aligned */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sync Section - Inset Grouped */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>SYNC</Text>
          <View style={styles.groupContainer}>
            {/* Auto Sync Row */}
            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Auto-sync LinkedIn</Text>
                <Text style={styles.rowSubtext}>
                  check for profile changes
                </Text>
              </View>
              <CustomSwitch value={autoSync} onValueChange={setAutoSync} />
            </View>

            <View style={styles.separator} />

            {/* Sync Now Row */}
            <TouchableOpacity style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Sync Now</Text>
                <Text style={styles.rowSubtext}>
                  refresh data manually
                </Text>
              </View>
              <Ionicons name="refresh" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Section - Inset Grouped */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>DATA</Text>
          <View style={styles.groupContainer}>
            <TouchableOpacity
              style={styles.row}
              onPress={handleResetCard}
            >
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: '#FF3B30' }]}>Reset Card</Text>
                <Text style={styles.rowSubtext}>
                  delete card and start fresh
                </Text>
              </View>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>LinkCard v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS Grouped Background Color
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, // Standard Margin
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 12,
    backgroundColor: '#F2F2F7', // Match background
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.4,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 24,
    marginHorizontal: 16, // Inset Grouped Margin
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6D6D72',
    marginBottom: 8,
    marginLeft: 16, // Align with text inside group
    textTransform: 'uppercase',
  },
  groupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12, // Rounded corners for the group
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 60, // Ensure touch target
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 16, // Inset separator
  },
  rowContent: {
    flex: 1,
    paddingRight: 16,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
    letterSpacing: -0.4,
  },
  rowSubtext: {
    fontSize: 14, // Slightly smaller
    color: '#8E8E93',
    letterSpacing: -0.2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  // Refined Switch Styles
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
