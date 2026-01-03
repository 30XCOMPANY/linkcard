/**
 * LinkCard Design System - Glass Card Pattern
 * 
 * Glassmorphism card with blur effect, using design system tokens.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { shadows } from '../tokens/shadows';
import { spacing } from '../tokens/spacing';

type RadiiToken = keyof typeof radii;
type ShadowToken = keyof typeof shadows;
type SpacingToken = keyof typeof spacing;

export interface GlassCardProps {
    children: React.ReactNode;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
    padding?: SpacingToken;
    borderRadius?: RadiiToken;
    shadow?: ShadowToken;
    style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    intensity = 20,
    tint = 'light',
    padding = 'lg',
    borderRadius = 'xl',
    shadow = 'sm',
    style,
}) => {
    const containerStyle: ViewStyle = {
        borderRadius: radii[borderRadius],
        ...shadows[shadow],
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
    };

    // Use BlurView on native platforms
    if (Platform.OS !== 'web') {
        return (
            <View style={[containerStyle, style]}>
                <BlurView
                    intensity={intensity}
                    tint={tint}
                    style={[styles.blurView, { borderRadius: radii[borderRadius], padding: spacing[padding] }]}
                >
                    {children}
                </BlurView>
            </View>
        );
    }

    // Web fallback with CSS backdrop-filter
    return (
        <View
            style={[
                containerStyle,
                styles.webGlass,
                { padding: spacing[padding] },
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    blurView: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    webGlass: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        ...(Platform.OS === 'web'
            ? {
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }
            : {}),
    },
});
