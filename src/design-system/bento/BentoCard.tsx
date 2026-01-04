/**
 * LinkCard Design System - Bento Card
 * 
 * Core Bento card component with size variants.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, StyleProp } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';
import { shadows } from '../tokens/shadows';

type ColorToken = keyof typeof colors;

export type BentoCardSize = '1x1' | '2x1' | '1x2' | '2x2';

export interface BentoCardProps {
    children: React.ReactNode;
    size?: BentoCardSize;
    bg?: ColorToken;
    onPress?: () => void;
    interactive?: boolean;
    style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const BentoCard: React.FC<BentoCardProps> = ({
    children,
    size = '1x1',
    bg = 'white',
    onPress,
    interactive = false,
    style,
}) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        if (interactive || onPress) {
            scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
        }
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // Aspect ratios based on size
    const sizeStyles: Record<BentoCardSize, ViewStyle> = {
        '1x1': { aspectRatio: 1 },
        '2x1': { aspectRatio: 2 },
        '1x2': { aspectRatio: 0.5 },
        '2x2': { aspectRatio: 1 },
    };

    const cardStyle = {
        backgroundColor: colors[bg],
        borderRadius: radii['2xl'],
        padding: spacing['2xl'],
        overflow: 'hidden' as const,
        ...shadows.sm,
        ...sizeStyles[size],
    };

    if (onPress) {
        return (
            <AnimatedPressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[cardStyle as any, animatedStyle, style]}
            >
                {children}
            </AnimatedPressable>
        );
    }

    return (
        <Animated.View style={[cardStyle as any, animatedStyle, style]}>
            {children}
        </Animated.View>
    );
};

// Pre-styled Bento card variants
export const BentoCardPrimary: React.FC<Omit<BentoCardProps, 'bg'>> = (props) => (
    <BentoCard bg="dark" {...props} />
);

export const BentoCardSecondary: React.FC<Omit<BentoCardProps, 'bg'>> = (props) => (
    <BentoCard bg="card" {...props} />
);

export const BentoCardAccent: React.FC<Omit<BentoCardProps, 'bg'>> = (props) => (
    <BentoCard bg="blue" {...props} />
);

export const BentoCardDark: React.FC<Omit<BentoCardProps, 'bg'>> = (props) => (
    <BentoCard bg="dark" {...props} />
);
