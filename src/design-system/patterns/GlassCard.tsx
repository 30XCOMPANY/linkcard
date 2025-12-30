/**
 * LinkCard Design System - Glass Card (V7 Labs Style)
 * 
 * Frosted glass card with blur backdrop.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';

interface GlassCardProps {
    children: React.ReactNode;
    variant?: 'light' | 'dark';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
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

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    variant = 'light',
    padding = 'lg',
    borderRadius = '2xl',
    style,
}) => {
    const isLight = variant === 'light';

    const cardStyle: ViewStyle = {
        padding: paddingMap[padding],
        borderRadius: radii[borderRadius],
        backgroundColor: isLight ? colors.glass : 'rgba(28, 28, 28, 0.8)',
        borderWidth: 1,
        borderColor: isLight ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        // Web-only backdrop blur
        ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
        } as any : {}),
    };

    return <View style={[cardStyle, style]}>{children}</View>;
};

// Glass Navigation Bar
interface GlassNavProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const GlassNav: React.FC<GlassNavProps> = ({ children, style }) => {
    return (
        <View style={[styles.nav, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    nav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.lg,
        backgroundColor: colors.glass,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        } as any : {}),
    },
});
