import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { spacing, colors, animations } from '@/src/constants/theme';

type CardVariant = 'default' | 'bordered' | 'inverted';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  noPadding?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Card Component - Minimalist Monochrome
 * 
 * Sharp corners (0 radius). Black borders.
 * Inverts on hover/press for emphasis.
 * No shadows - depth through contrast.
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  onPress,
  noPadding = false,
  style,
}) => {
  const isPressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    if (variant === 'bordered') {
      // Invert on press
      return {
        backgroundColor: isPressed.value ? colors.black : colors.white,
      };
    }
    return {};
  });

  const handlePressIn = () => {
    if (onPress) {
      isPressed.value = withTiming(1, { duration: animations.duration.fast });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      isPressed.value = withTiming(0, { duration: animations.duration.fast });
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'bordered':
        return {
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.black,
        };
      case 'inverted':
        return {
          backgroundColor: colors.black,
        };
      default:
        return {
          backgroundColor: colors.white,
        };
    }
  };

  const content = (
    <View style={[styles.inner, !noPadding && styles.padding]}>
      {children}
    </View>
  );

  const cardStyles = [
    styles.card,
    getVariantStyle(),
    style,
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[cardStyles, animatedStyle]}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View style={cardStyles}>
      {content}
    </Animated.View>
  );
};

/**
 * Inverted Card - Black background, white text
 * For emphasis sections
 */
export const InvertedCard: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
  noPadding?: boolean;
  style?: ViewStyle;
}> = ({ children, onPress, noPadding = false, style }) => {
  return (
    <Card variant="inverted" onPress={onPress} noPadding={noPadding} style={style}>
      {children}
    </Card>
  );
};

/**
 * Bordered Card with hover inversion
 */
export const BorderedCard: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
  noPadding?: boolean;
  style?: ViewStyle;
}> = ({ children, onPress, noPadding = false, style }) => {
  return (
    <Card variant="bordered" onPress={onPress} noPadding={noPadding} style={style}>
      {children}
    </Card>
  );
};

// Bento Grid Container
interface BentoGridProps {
  children: React.ReactNode;
  columns?: 2 | 3;
  style?: ViewStyle;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  columns = 2,
  style,
}) => {
  return (
    <View style={[styles.grid, { gap: spacing.md }, style]}>
      {children}
    </View>
  );
};

// Bento Row for horizontal card arrangement
interface BentoRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const BentoRow: React.FC<BentoRowProps> = ({ children, style }) => {
  return (
    <View style={[styles.row, style]}>
      {children}
    </View>
  );
};

// Legacy exports for backward compatibility
export const FeaturedCard = InvertedCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 0, // SHARP CORNERS - non-negotiable
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
  },
  padding: {
    padding: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
});

