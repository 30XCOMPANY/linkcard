/**
 * LinkCard Design System - Glass Button Pattern
 * 
 * Glassmorphism button with blur effect, using design system tokens.
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';
import { colors } from '../tokens/colors';
import { fontSize, fontFamily } from '../tokens/typography';

type SpacingToken = keyof typeof spacing;

interface GlassButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    variant?: 'glass' | 'primary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    onPress,
    icon,
    variant = 'glass',
    size = 'md',
    fullWidth = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const sizeStyles = {
        sm: { height: 36, paddingHorizontal: spacing.lg },
        md: { height: 44, paddingHorizontal: spacing.xl },
        lg: { height: 52, paddingHorizontal: spacing['2xl'] },
    };

    const fontSizes = {
        sm: fontSize.xs,
        md: fontSize.sm,
        lg: fontSize.base,
    };

    const renderChildren = () => {
        if (typeof children === 'string') {
            return (
                <Text style={[styles.text, { color: textColors[variant], fontSize: fontSizes[size] }, textStyle]}>
                    {children}
                </Text>
            );
        }
        return children;
    };

    const textColors = {
        glass: colors.text,
        primary: colors.white,
        outline: colors.text,
    };

    // For glass variant, use BlurView on iOS/Android, fallback to semi-transparent on web
    if (variant === 'glass' && Platform.OS !== 'web') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                style={[
                    styles.base,
                    sizeStyles[size],
                    fullWidth && styles.fullWidth,
                    disabled && styles.disabled,
                    style,
                ]}
                activeOpacity={0.7}
            >
                <BlurView
                    intensity={20}
                    tint="light"
                    style={[styles.blurContainer, { borderRadius: radii.pill }]}
                >
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={18}
                            color={colors.text}
                            style={{ marginRight: spacing.sm }}
                        />
                    )}
                    {typeof children === 'string' ? (
                        <Text style={[styles.glassText, { fontSize: fontSizes[size] }, textStyle]}>
                            {children}
                        </Text>
                    ) : (
                        children
                    )}
                </BlurView>
            </TouchableOpacity>
        );
    }

    // For web or other variants
    const variantStyles = {
        glass: styles.glassButton,
        primary: styles.primaryButton,
        outline: styles.outlineButton,
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.base,
                sizeStyles[size],
                variantStyles[variant],
                fullWidth && styles.fullWidth,
                disabled && styles.disabled,
                style,
            ]}
            activeOpacity={0.7}
        >
            {icon && (
                <Ionicons
                    name={icon}
                    size={18}
                    color={textColors[variant]}
                    style={{ marginRight: spacing.sm }}
                />
            )}
            {renderChildren()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.pill,
        overflow: 'hidden',
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    blurContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    glassButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        ...(Platform.OS === 'web'
            ? {
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }
            : {}),
    },
    primaryButton: {
        backgroundColor: colors.info,
        borderWidth: 0,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
    },
    text: {
        fontFamily: fontFamily.bodySemibold,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    glassText: {
        color: colors.text,
        fontFamily: fontFamily.bodySemibold,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
});
