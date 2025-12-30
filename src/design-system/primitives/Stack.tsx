/**
 * LinkCard Design System - Stack Primitive
 * 
 * Vertical or horizontal stacking with consistent spacing.
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { spacing } from '../tokens/spacing';

type SpacingToken = keyof typeof spacing;

export interface StackProps {
    children: React.ReactNode;
    direction?: 'vertical' | 'horizontal';
    gap?: SpacingToken;
    align?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
    style?: ViewStyle;
}

export const Stack: React.FC<StackProps> = ({
    children,
    direction = 'vertical',
    gap = 'md',
    align = 'stretch',
    style,
}) => {
    const stackStyle: ViewStyle = {
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        gap: spacing[gap],
        alignItems: align,
    };

    return <View style={[stackStyle, style]}>{children}</View>;
};

// Shorthand components
export const VStack: React.FC<Omit<StackProps, 'direction'>> = (props) => (
    <Stack direction="vertical" {...props} />
);

export const HStack: React.FC<Omit<StackProps, 'direction'>> = (props) => (
    <Stack direction="horizontal" {...props} />
);
