import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { radius, spacing, shadows } from '@/src/constants/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  accentColor?: string;
  showBorder?: boolean;
  style?: ViewStyle;
}

const sizeMap: Record<string, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
  '2xl': 128,
};

const fontSizeMap: Record<string, number> = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 36,
  '2xl': 48,
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name = '',
  size = 'md',
  accentColor = '#6366F1',
  showBorder = false,
  style,
}) => {
  // Support both preset sizes and custom numeric sizes
  const dimension = typeof size === 'number' ? size : sizeMap[size] || 48;
  const fontSize = typeof size === 'number' ? Math.round(size * 0.375) : fontSizeMap[size as string] || 16;

  // Get initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  if (source) {
    return (
      <View
        style={[
          styles.container,
          containerStyle,
          showBorder && { borderWidth: 3, borderColor: accentColor },
          shadows.sm,
          style,
        ]}
      >
        <Image
          source={{ uri: source }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
      </View>
    );
  }

  // Fallback to initials with gradient
  return (
    <View
      style={[
        styles.container,
        containerStyle,
        showBorder && { borderWidth: 3, borderColor: accentColor },
        shadows.sm,
        style,
      ]}
    >
      <LinearGradient
        colors={[accentColor, adjustColor(accentColor, -30)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.initials, { fontSize }]}>
          {getInitials(name)}
        </Text>
      </LinearGradient>
    </View>
  );
};

// Helper to darken/lighten a color
const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});



