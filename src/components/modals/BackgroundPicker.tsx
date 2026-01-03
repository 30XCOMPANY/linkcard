/**
 * LinkCard Design System - Background Picker Modal
 * 
 * Modal to select gradient backgrounds for the profile page.
 */

import React from 'react';
import {
    Modal,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

// Design System
import { Box, VStack, HStack, Text } from '@/src/design-system/primitives';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import { radii } from '@/src/design-system/tokens/radii';
import { shadows } from '@/src/design-system/tokens/shadows';
import { gradients } from '@/src/design-system/tokens/effects';

type GradientKey = keyof typeof gradients;

interface BackgroundPickerProps {
    visible: boolean;
    onClose: () => void;
    currentGradient: GradientKey;
    onSelect: (gradient: GradientKey) => void;
}

const gradientOptions: Array<{ key: GradientKey; name: string }> = [
    { key: 'lightGlass', name: 'Fresh Blue' },
    { key: 'peach', name: 'Warm Peach' },
    { key: 'mint', name: 'Cool Mint' },
    { key: 'purple', name: 'Purple Dream' },
    { key: 'rose', name: 'Soft Pink' },
    { key: 'mesh', name: 'V7 Classic' },
];

export const BackgroundPicker: React.FC<BackgroundPickerProps> = ({
    visible,
    onClose,
    currentGradient,
    onSelect,
}) => {
    const handleSelect = (key: GradientKey) => {
        onSelect(key);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            {/* Backdrop */}
            <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={styles.backdrop}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                {/* Modal Content */}
                <Animated.View
                    entering={SlideInDown.springify()}
                    exiting={SlideOutDown.springify()}
                    style={styles.modalContainer}
                >
                    <VStack gap="md" style={{ padding: spacing['2xl'] }}>
                        {/* Header */}
                        <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text variant="h3">Choose Background</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </HStack>

                        {/* Gradient Grid */}
                        <Box style={styles.gridContainer}>
                            {gradientOptions.map((option) => {
                                const isSelected = option.key === currentGradient;
                                return (
                                    <TouchableOpacity
                                        key={option.key}
                                        onPress={() => handleSelect(option.key)}
                                        style={styles.gradientItem}
                                    >
                                        <LinearGradient
                                            colors={gradients[option.key] as string[]}
                                            style={[
                                                styles.gradientPreview,
                                                isSelected && styles.selected,
                                            ]}
                                            locations={option.key === 'lightGlass' ? [0, 0.3, 0.7, 1] : undefined}
                                        >
                                            {isSelected && (
                                                <Box
                                                    style={{
                                                        position: 'absolute',
                                                        top: spacing.sm,
                                                        right: spacing.sm,
                                                        backgroundColor: colors.white,
                                                        borderRadius: radii.full,
                                                        width: 24,
                                                        height: 24,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Ionicons name="checkmark" size={16} color={colors.info} />
                                                </Box>
                                            )}
                                        </LinearGradient>
                                        <Text variant="caption" align="center" style={{ marginTop: spacing.xs }}>
                                            {option.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </Box>
                    </VStack>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderTopLeftRadius: radii['2xl'],
        borderTopRightRadius: radii['2xl'],
        paddingBottom: spacing['2xl'],
        ...shadows.xl,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: radii.full,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.lg,
        marginTop: spacing.md,
    },
    gradientItem: {
        width: '30%',
        alignItems: 'center',
    },
    gradientPreview: {
        width: '100%',
        aspectRatio: 0.75,
        borderRadius: radii.lg,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    selected: {
        borderColor: colors.info,
    },
});
