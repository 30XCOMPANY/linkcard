import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { spacing, typography, colors, animation, radii } from '@/src/design-system/tokens';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'url' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * Input Component - LinkCard Style
 * 
 * Light theme with subtle borders.
 * Focus: border darkens.
 */
export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helper,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'none',
  secureTextEntry = false,
  icon,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: animation.duration.normal });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusProgress.value = withTiming(0, { duration: animation.duration.normal });
  };

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = error
      ? colors.error
      : focusProgress.value === 1
        ? colors.foreground
        : colors.border;

    return {
      borderColor,
      borderWidth: 1,
    };
  });

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <AnimatedView style={[styles.inputContainer, animatedBorderStyle]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            icon ? styles.inputWithIcon : undefined,
            disabled && styles.disabledInput,
          ]}
        />
      </AnimatedView>

      {(error || helper) && (
        <Text style={[styles.helperText, error ? styles.errorText : undefined]}>
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontFamily: typography.fontFamily.bodySemibold,
    fontSize: typography.fontSize.sm,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    paddingLeft: spacing.lg,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: colors.foreground,
  },
  inputWithIcon: {
    paddingLeft: spacing.md,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.lg,
  },
  disabledInput: {
    color: colors.mutedForeground,
    opacity: 0.6,
  },
  helperText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.error,
  },
});

