/**
 * LinkCard Design System - Share Menu Modal
 * 
 * Glassmorphism modal with three sharing options:
 * 1. Share Card (Image)
 * 2. Digital Business Card (Contact export)
 * 3. Apple Wallet (PassKit)
 */

import React from 'react';
import {
    Modal,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Design System
import { Box, VStack, HStack, Text } from '@/src/design-system/primitives';
import { GlassCard } from '@/src/design-system/patterns';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import { radii } from '@/src/design-system/tokens/radii';
import { shadows } from '@/src/design-system/tokens/shadows';

interface ShareMenuProps {
    visible: boolean;
    onClose: () => void;
    onShareCard: () => void;
    onDigitalCard: () => void;
    onAppleWallet: () => void;
}

export const ShareMenu: React.FC<ShareMenuProps> = ({
    visible,
    onClose,
    onShareCard,
    onDigitalCard,
    onAppleWallet,
}) => {
    const handleAction = (action: () => void) => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        action();
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
                            <Text variant="h3">Share Options</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </HStack>

                        {/* Options */}
                        <VStack gap="sm" style={{ marginTop: spacing.md }}>
                            {/* Share Card */}
                            <GlassCard padding="lg" borderRadius="xl">
                                <TouchableOpacity
                                    onPress={() => handleAction(onShareCard)}
                                    style={styles.option}
                                >
                                    <Box
                                        width={48}
                                        height={48}
                                        borderRadius="xl"
                                        style={{ backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Ionicons name="share-social" size={24} color={colors.info} />
                                    </Box>
                                    <VStack gap="xs" style={{ flex: 1 }}>
                                        <Text variant="body" weight="semibold">
                                            Share Card
                                        </Text>
                                        <Text variant="caption" color="textMuted">
                                            Generate a beautiful card image for social media
                                        </Text>
                                    </VStack>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            </GlassCard>

                            {/* Digital Business Card */}
                            <GlassCard padding="lg" borderRadius="xl">
                                <TouchableOpacity
                                    onPress={() => handleAction(onDigitalCard)}
                                    style={styles.option}
                                >
                                    <Box
                                        width={48}
                                        height={48}
                                        borderRadius="xl"
                                        style={{ backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Ionicons name="card" size={24} color="#8B5CF6" />
                                    </Box>
                                    <VStack gap="xs" style={{ flex: 1 }}>
                                        <Text variant="body" weight="semibold">
                                            生成电子名片
                                        </Text>
                                        <Text variant="caption" color="textMuted">
                                            导出为 vCard 格式，保存到通讯录
                                        </Text>
                                    </VStack>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            </GlassCard>

                            {/* Apple Wallet */}
                            <GlassCard padding="lg" borderRadius="xl">
                                <TouchableOpacity
                                    onPress={() => handleAction(onAppleWallet)}
                                    style={styles.option}
                                >
                                    <Box
                                        width={48}
                                        height={48}
                                        borderRadius="xl"
                                        style={{ backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Ionicons name="wallet" size={24} color="#F59E0B" />
                                    </Box>
                                    <VStack gap="xs" style={{ flex: 1 }}>
                                        <Text variant="body" weight="semibold">
                                            加入 Apple Wallet
                                        </Text>
                                        <Text variant="caption" color="textMuted">
                                            添加到钱包，快速展示你的名片
                                        </Text>
                                    </VStack>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            </GlassCard>
                        </VStack>
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
        paddingBottom: Platform.OS === 'ios' ? 34 : spacing['2xl'],
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
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
});
