/**
 * LinkCard Design System - Button Pattern (V7 Labs Style)
 * 
 * Features:
 * - 160px pill radius (V7 exact)
 * - #1C1C1C dark primary
 * - 12px button text
 * - 40px / 52px heights
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    ViewStyle,
    Platform,
} from 'react-native';
import { colors } from '../tokens/colors';
import { fontFamily, fontSize } from '../tokens/typography';
import { spacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';

export interface ButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    onPress,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon,
    style,
}) => {
    const isDisabled = disabled || loading;

    // V7 Labs exact heights: 40px standard, 52px floating
    const sizeStyles = {
        sm: { height: 36, paddingHorizontal: spacing.lg },
        md: { height: 40, paddingHorizontal: spacing['2xl'] },
        lg: { height: 52, paddingHorizontal: spacing['3xl'] },
    };

    const variantStyles = {
        primary: {
            backgroundColor: colors.dark,
            borderWidth: 0,
        },
        secondary: {
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: colors.border,
        },
        outline: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.text,
        },
        ghost: {
            backgroundColor: 'transparent',
            borderWidth: 0,
        },
    };

    const textColors = {
        primary: colors.white,
        secondary: colors.text,
        outline: colors.text,
        ghost: colors.text,
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            style={[
                styles.base,
                sizeStyles[size],
                variantStyles[variant],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator size="small" color={textColors[variant]} />
            ) : (
                <>
                    {icon}
                    <Text style={[styles.text, { color: textColors[variant] }]}>
                        {children}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        borderRadius: radii.pill,  // V7's 160px pill!
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontFamily: fontFamily.bodyMedium,
        fontSize: fontSize.xs,       // V7 uses 12px button text
        letterSpacing: 0.5,          // Slightly tracked out
    },
});
