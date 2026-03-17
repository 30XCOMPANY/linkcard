import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { spacing, typography, colors, shadows, animation, radii } from '@/src/design-system/tokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
}

/**
 * Button Component - LinkCard Style
 * 
 * Primary: White/cream pill button with subtle sunburst gradient
 * Matching the LinkCard website "Join Waitlist" button
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'right',
  style,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, animation.springs.snappy);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.springs.snappy);
  };

  const sizeStyles = {
    sm: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      fontSize: typography.fontSize.sm,
    },
    md: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      fontSize: typography.fontSize.md,
    },
    lg: {
      paddingVertical: 18,
      paddingHorizontal: 40,
      fontSize: typography.fontSize.lg,
    },
  };

  const currentSize = sizeStyles[size];

  // Primary variant - sunburst gradient button
  if (variant === 'primary') {
    return (
      <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.95}
          style={[styles.primaryButton, shadows.md, fullWidth && styles.fullWidth]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.98)', 'rgba(245,245,243,0.95)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[
              styles.gradientInner,
              {
                paddingVertical: currentSize.paddingVertical,
                paddingHorizontal: currentSize.paddingHorizontal,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.foreground} size="small" />
            ) : (
              <View style={styles.content}>
                {icon && iconPosition === 'left' && (
                  <View style={styles.iconLeft}>{icon}</View>
                )}
                <Text style={[styles.primaryText, { fontSize: currentSize.fontSize }]}>
                  {children}
                </Text>
                {icon && iconPosition === 'right' && (
                  <View style={styles.iconRight}>{icon}</View>
                )}
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Secondary/Ghost variants
  const getStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.foreground,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {};
    }
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        getStyles(),
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderRadius: radii.full,
        },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.foreground} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              { fontSize: currentSize.fontSize },
              variant === 'ghost' && styles.ghostText,
            ]}
          >
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </AnimatedTouchable>
  );
};

// Legacy export
export const GradientButton = Button;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: typography.fontFamily.body,
    color: colors.foreground,
    fontWeight: '400',
  },
  ghostText: {
    textDecorationLine: 'underline',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  // Primary button - sunburst style
  primaryButton: {
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  gradientInner: {
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontFamily: typography.fontFamily.body,
    color: colors.foreground,
    fontWeight: '400',
  },
});

