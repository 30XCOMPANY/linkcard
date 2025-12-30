/**
 * LinkCard Design System - Bento Grid
 * 
 * Grid container for Bento-style layouts.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, useWindowDimensions } from 'react-native';
import { spacing } from '../tokens/spacing';

export interface BentoGridProps {
    children: React.ReactNode;
    columns?: 2 | 3 | 4;
    gap?: 'sm' | 'md' | 'lg';
    style?: ViewStyle;
}

const gapMap = {
    sm: spacing.lg,
    md: spacing.xl,
    lg: spacing['2xl'],
};

export const BentoGrid: React.FC<BentoGridProps> = ({
    children,
    columns = 2,
    gap = 'lg',
    style,
}) => {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const actualColumns = isDesktop ? columns : 1;

    const gridStyle: ViewStyle = {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: gapMap[gap],
        justifyContent: 'flex-start',
    };

    return (
        <View style={[gridStyle, style]}>
            {React.Children.map(children, (child, index) => (
                <View
                    key={index}
                    style={{
                        width: isDesktop
                            ? `${100 / actualColumns - 2}%`
                            : '100%',
                    }}
                >
                    {child}
                </View>
            ))}
        </View>
    );
};

// Bento Cell for manual grid positioning
export interface BentoCellProps {
    children: React.ReactNode;
    span?: 1 | 2;
    style?: ViewStyle;
}

export const BentoCell: React.FC<BentoCellProps> = ({
    children,
    span = 1,
    style,
}) => {
    const cellStyle: ViewStyle = {
        flex: span,
        minWidth: span === 2 ? '60%' : '40%',
    };

    return <View style={[cellStyle, style]}>{children}</View>;
};
