/**
 * LinkCard Design System - Input Pattern
 * 
 * Input component with label and error states.
 */

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ViewStyle,
    TextInputProps,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import { colors } from '../tokens/colors';
import { fontFamily, fontSize } from '../tokens/typography';
import { spacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';

export interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    helper?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helper,
    disabled = false,
    icon,
    style,
    ...textInputProps
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusProgress = useSharedValue(0);

    const handleFocus = () => {
        setIsFocused(true);
        focusProgress.value = withTiming(1, { duration: 200 });
    };

    const handleBlur = () => {
        setIsFocused(false);
        focusProgress.value = withTiming(0, { duration: 200 });
    };

    const animatedBorderStyle = useAnimatedStyle(() => ({
        borderColor: error
            ? colors.error
            : focusProgress.value === 1
                ? colors.dark
                : colors.border,
    }));

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <AnimatedView style={[styles.inputContainer, animatedBorderStyle]}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}

                <TextInput
                    {...textInputProps}
                    editable={!disabled}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholderTextColor={colors.placeholder}
                    style={[
                        styles.input,
                        icon ? styles.inputWithIcon : null,
                        disabled ? styles.disabledInput : null,
                    ]}
                />
            </AnimatedView>

            {(error || helper) && (
                <Text style={[styles.helperText, error ? styles.errorText : null]}>
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
        fontFamily: fontFamily.bodyMedium,
        fontSize: fontSize.sm,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    inputContainer: {
        backgroundColor: colors.white,
        borderRadius: 12, // More Apple-like rectangle, less pill
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        // Slight shadow for depth like Stripe/Apple inputs
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
    },
    iconContainer: {
        paddingLeft: spacing.lg,
    },
    input: {
        flex: 1,
        paddingVertical: 14, // Crisper height
        paddingHorizontal: spacing.lg,
        fontSize: 15, // Legible standard size
        fontFamily: fontFamily.body,
        color: colors.text,
    },
    inputWithIcon: {
        paddingLeft: spacing.md,
    },
    disabledInput: {
        color: colors.textMuted,
        opacity: 0.6,
    },
    helperText: {
        fontFamily: fontFamily.body,
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    errorText: {
        color: colors.error,
    },
});
