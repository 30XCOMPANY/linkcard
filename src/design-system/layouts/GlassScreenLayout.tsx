/**
 * GlassScreenLayout - Reusable screen layout with gradient background
 * 
 * This component provides a consistent layout for all screens in the app:
 * - Gradient background (synced from cardStore)
 * - Standard header with back button and title
 * - Scrollable content area
 * - Dynamic text colors based on background
 */

import React, { ReactNode, useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Box, HStack, Text } from '@/src/design-system/primitives';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import { gradients } from '@/src/design-system/tokens/effects';
import { useCardStore } from '@/src/stores/cardStore';

interface GlassScreenLayoutProps {
    title: string;
    children: ReactNode;
    showBackButton?: boolean;
    backIcon?: string;
    onBack?: () => void;
    rightElement?: ReactNode;
    scrollable?: boolean;
}

export const GlassScreenLayout: React.FC<GlassScreenLayoutProps> = ({
    title,
    children,
    showBackButton = true,
    backIcon = 'chevron-back',
    onBack,
    rightElement,
    scrollable = true,
}) => {
    const router = useRouter();
    const { currentGradient } = useCardStore();

    // Dynamic text colors based on background
    const isDarkBackground = useMemo(() => {
        if (typeof currentGradient === 'string' && currentGradient.includes('/')) {
            return true; // Default to light text for custom images
        }
        return ['black', 'ocean', 'purple', 'sunset', 'midnight'].includes(currentGradient);
    }, [currentGradient]);

    const textColor = shouldForceDarkIcon() ? colors.dark : (isDarkBackground ? colors.white : colors.text);

    // Helper to determine if we should force dark icon (e.g. for light glass backgrounds)
    function shouldForceDarkIcon() {
        return !isDarkBackground; // Simple heuristic for now, can be refined
    }

    const buttonBackgroundColor = isDarkBackground
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(255, 255, 255, 0.4)';

    const handleBack = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        if (onBack) {
            onBack();
        } else if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/glass-home');
        }
    };

    const gradientKey = currentGradient as keyof typeof gradients;
    const gradientColors = gradients[gradientKey] || gradients.lightGlass;

    const content = (
        <>
            {/* Header */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
                <Box pt="6xl" pb="xl">
                    <HStack align="center" style={{ justifyContent: 'space-between' }}>
                        {showBackButton ? (
                            <TouchableOpacity
                                onPress={handleBack}
                                style={[styles.headerButton, { backgroundColor: buttonBackgroundColor }]}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name={backIcon as any} size={24} color={textColor} />
                            </TouchableOpacity>
                        ) : (
                            <Box style={{ width: 40 }} />
                        )}
                        <Text variant="h2" style={{ color: textColor }}>
                            {title}
                        </Text>
                        {rightElement ? (
                            // Determine if rightElement is a button that needs similar styling, 
                            // but usually it's passed as a custom component. 
                            // For consistency, we might want to wrap it or let the consumer handle it.
                            // For now, render as is.
                            rightElement
                        ) : (
                            <Box style={{ width: 40 }} />
                        )}
                    </HStack>
                </Box>
            </Animated.View>

            {/* Content */}
            {children}
        </>
    );

    return (
        <Box flex={1}>
            {/* Background Gradient */}
            <LinearGradient
                colors={[...gradientColors]}
                locations={currentGradient === 'lightGlass' ? [0, 0.3, 0.7, 1] : undefined}
                style={StyleSheet.absoluteFill}
            />

            {scrollable ? (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: spacing['3xl'], paddingBottom: 120 }}
                >
                    {content}
                </ScrollView>
            ) : (
                <Box px="3xl" pb="6xl" flex={1}>
                    {content}
                </Box>
            )}
        </Box>
    );
};

const styles = StyleSheet.create({
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20, // Full circle
    },
});
