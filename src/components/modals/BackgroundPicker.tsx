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
    ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
    currentGradient: GradientKey | string;
    onSelect: (gradient: GradientKey | string) => void;
}

const gradientOptions: Array<{ key: GradientKey; name: string }> = [
    { key: 'lightGlass', name: 'Fresh Blue' },
    { key: 'peach', name: 'Warm Peach' },
    { key: 'mint', name: 'Cool Mint' },
    { key: 'purple', name: 'Purple Dream' },
    { key: 'rose', name: 'Soft Pink' },
    { key: 'white', name: 'Pure White' },
    { key: 'black', name: 'Pure Black' },
    { key: 'v7Classic', name: 'V7 Classic' },
];

export const BackgroundPicker: React.FC<BackgroundPickerProps> = ({
    visible,
    onClose,
    currentGradient,
    onSelect,
}) => {
    const handleSelect = (key: GradientKey | string) => {
        onSelect(key as GradientKey); // Cast for now, but parent should handle string
        onClose();
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [9, 16], // Phone screen aspect ratio
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            handleSelect(result.assets[0].uri);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={styles.backdrop}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <Animated.View
                    entering={SlideInDown.springify()}
                    exiting={SlideOutDown.springify()}
                    style={styles.modalContainer}
                >
                    <VStack gap="md">
                        {/* Header - Fixed */}
                        <Box style={{ paddingHorizontal: spacing['2xl'], paddingTop: spacing['2xl'], paddingBottom: spacing.md }}>
                            <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text variant="h3">Background</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </HStack>
                        </Box>

                        {/* Scrollable Content */}
                        <ScrollView
                            style={{ maxHeight: 500 }}
                            contentContainerStyle={{ paddingHorizontal: spacing['2xl'], paddingBottom: spacing['4xl'] }}
                            showsVerticalScrollIndicator={false}
                        >
                            <VStack gap="lg">
                                {/* Custom Upload Section */}
                                <VStack gap="sm">
                                    <Text variant="body" weight="semibold" color="textMuted">Custom</Text>
                                    <TouchableOpacity
                                        onPress={handlePickImage}
                                        style={styles.uploadButton}
                                        activeOpacity={0.7}
                                    >
                                        <VStack align="center" gap="sm">
                                            <Box
                                                width={48}
                                                height={48}
                                                borderRadius="full"
                                                style={{ backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <Ionicons name="image-outline" size={24} color={colors.text} />
                                            </Box>
                                            <Text variant="body" weight="medium">Upload Image</Text>
                                        </VStack>
                                    </TouchableOpacity>
                                </VStack>

                                {/* Presets Grid */}
                                <VStack gap="sm">
                                    <Text variant="body" weight="semibold" color="textMuted">Presets</Text>
                                    <Box style={styles.gridContainer}>
                                        {gradientOptions.map((option) => {
                                            const isSelected = option.key === currentGradient;
                                            return (
                                                <TouchableOpacity
                                                    key={option.key}
                                                    onPress={() => handleSelect(option.key)}
                                                    style={styles.gradientItem}
                                                    activeOpacity={0.7}
                                                >
                                                    <LinearGradient
                                                        colors={[...gradients[option.key]]}
                                                        style={[
                                                            styles.gradientPreview,
                                                            isSelected && styles.selected,
                                                        ]}
                                                        locations={option.key === 'lightGlass' ? [0, 0.3, 0.7, 1] : undefined}
                                                    >
                                                        {isSelected && (
                                                            <Box style={styles.checkBadges}>
                                                                <Ionicons name="checkmark" size={12} color={colors.white} />
                                                            </Box>
                                                        )}
                                                    </LinearGradient>
                                                    <Text variant="caption" align="center" style={{ marginTop: spacing.xs, fontSize: 11 }} numberOfLines={1}>
                                                        {option.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </Box>
                                </VStack>
                            </VStack>
                        </ScrollView>
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
        width: '31%',
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
    uploadButton: {
        width: '100%',
        height: 100,
        backgroundColor: colors.card,
        borderRadius: radii.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        borderStyle: 'solid',
    },
    checkBadges: {
        position: 'absolute',
        top: spacing.xs,
        right: spacing.xs,
        backgroundColor: colors.info,
        borderRadius: radii.full,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
