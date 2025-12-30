/**
 * LinkCard Design System - Card Pattern
 * 
 * Card component with 32px radius (Bento style).
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';
import { shadows } from '../tokens/shadows';

type ColorToken = keyof typeof colors;
type ShadowToken = keyof typeof shadows;

export interface CardProps {
    children: React.ReactNode;
    bg?: ColorToken;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    shadow?: ShadowToken;
    borderRadius?: 'md' | 'lg' | 'xl' | '2xl';
    style?: ViewStyle;
}

const paddingMap = {
    none: 0,
    sm: spacing.md,
    md: spacing.lg,
    lg: spacing.xl,
    xl: spacing['2xl'],
};

export const Card: React.FC<CardProps> = ({
    children,
    bg = 'white',
    padding = 'lg',
    shadow = 'sm',
    borderRadius = '2xl',
    style,
}) => {
    const cardStyle: ViewStyle = {
        backgroundColor: colors[bg],
        padding: paddingMap[padding],
        borderRadius: radii[borderRadius],
        ...shadows[shadow],
    };

    return <View style={[cardStyle, style]}>{children}</View>;
};

// Bento-specific card variants
export const BentoCard: React.FC<CardProps & {
    size?: '1x1' | '2x1' | '1x2' | '2x2'
}> = ({
    size = '1x1',
    ...props
}) => {
        // Size ratios for Bento grid (assumes parent has proper grid)
        const sizeStyles: Record<string, ViewStyle> = {
            '1x1': { aspectRatio: 1 },
            '2x1': { aspectRatio: 2 },
            '1x2': { aspectRatio: 0.5 },
            '2x2': { aspectRatio: 1 },
        };

        return <Card {...props} style={[sizeStyles[size], props.style]} />;
    };
