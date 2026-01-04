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
            ['rgba(0, 0, 0, 0.08)', '#34C759'] // iOS green color when active
        );

        return {
            backgroundColor,
        };
    });

    const thumbStyle = useAnimatedStyle(() => {
        const translateX = progress.value * 20; // Adjusted for new size

        return {
            transform: [
                { translateX },
                { scale: withSpring(value ? 1 : 0.95, { damping: 15, stiffness: 200 }) },
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
                    opacity: pressed ? 0.7 : disabled ? 0.4 : 1,
                },
            ]}
        >
            <Animated.View style={[styles.track, trackStyle]}>
                <Animated.View style={[styles.thumb, thumbStyle]}>
                    <Box
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 13.5,
                            backgroundColor: colors.white,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.15,
                            shadowRadius: 3,
                            elevation: 3,
                        }}
                    />
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    track: {
        width: 51,
        height: 31,
        borderRadius: 15.5,
        padding: 2,
        justifyContent: 'center',
    },
    thumb: {
        width: 27,
        height: 27,
        borderRadius: 13.5,
    },
});
