/**
 * GlassToggle - iOS-style modern toggle switch
 * 
 * Features:
 * - iOS-inspired design
 * - Smooth spring animations
 * - Premium glassmorphic aesthetic
 * - Haptic feedback
 */

import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Box } from '@/src/design-system/primitives';
import { colors } from '@/src/design-system/tokens/colors';

interface GlassToggleProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
}

export const GlassToggle: React.FC<GlassToggleProps> = ({
    value,
    onValueChange,
    disabled = false,
}) => {
    const progress = useSharedValue(value ? 1 : 0);

    React.useEffect(() => {
        progress.value = withSpring(value ? 1 : 0, {
            damping: 20,
            stiffness: 180,
        });
    }, [value]);

    const trackStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            ['rgba(0, 0, 0, 0.06)', colors.dark] // Back to premium dark theme
        );

        return {
            backgroundColor,
        };
    });

    const thumbStyle = useAnimatedStyle(() => {
        const translateX = progress.value * 24; // 48(width) - 4(padding) - 20(thumb) = 24 travel distance

        return {
            transform: [
                { translateX },
                { scale: withSpring(1, { damping: 15, stiffness: 200 }) },
            ],
        };
    });

    const handleToggle = () => {
        if (disabled) return;

        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        onValueChange(!value);
    };

    return (
        <Pressable
            onPress={handleToggle}
            disabled={disabled}
            style={({ pressed }) => [
                {
                    opacity: pressed ? 0.8 : disabled ? 0.5 : 1,
                },
            ]}
        >
            <Animated.View style={[styles.track, trackStyle]}>
                <Animated.View style={[styles.thumb, thumbStyle]}>
                    <Box
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 10,
                            backgroundColor: colors.white,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 1,
                            elevation: 1,
                        }}
                    />
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    track: {
        width: 48,
        height: 24,
        borderRadius: 12,
        padding: 2,
        justifyContent: 'center',
    },
    thumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
});
