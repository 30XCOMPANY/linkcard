import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Button } from '@/src/components/ui';
import { Input } from '@/src/components/ui/Input';
import { getTheme, spacing, typography, radius, shadows } from '@/src/constants/theme';
import * as Haptics from 'expo-haptics';

type AuthMode = 'signin' | 'signup';

export default function AuthScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getTheme('light', colorScheme || 'light');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);

    try {
      // In production, this would call your auth API
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to onboarding (LinkedIn URL input)
      router.replace('/onboarding');
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                fontFamily: typography.fontFamily.display,
                color: theme.colors.text,
              },
            ]}
          >
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {mode === 'signin'
              ? 'Sign in to continue to LinkCard'
              : 'Get started with your digital business card'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
          {mode === 'signup' && (
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              label="Name"
              autoCapitalize="words"
              style={styles.input}
            />
          )}

          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            label="Password"
            secureTextEntry
            style={styles.input}
          />

          <Button
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!email || !password || (mode === 'signup' && !name)}
          >
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              { color: theme.colors.textSecondary },
            ]}
          >
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <Text
              style={[styles.link, { color: theme.colors.text }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMode(mode === 'signin' ? 'signup' : 'signin');
              }}
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.section,
    paddingBottom: spacing['4xl'],
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing['5xl'],
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['5xl'],
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal,
    textAlign: 'center',
    fontFamily: typography.fontFamily.body,
  },
  form: {
    gap: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  input: {
    marginBottom: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  footerText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
  },
  link: {
    fontFamily: typography.fontFamily.bodySemibold,
  },
});

