/**
 * LinkCard Design System - Add Tag Modal
 * 
 * Modal for adding new tags to the profile.
 */

import React, { useState } from 'react';
import {
    Modal,
    TouchableOpacity,
    StyleSheet,
    Platform,
    TextInput,
    KeyboardAvoidingView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Design System
import { Box, VStack, HStack, Text } from '@/src/design-system/primitives';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import { radii } from '@/src/design-system/tokens/radii';
import { shadows } from '@/src/design-system/tokens/shadows';

interface AddTagModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (tag: { label: string; icon: string }) => void;
}

export const AddTagModal: React.FC<AddTagModalProps> = ({
    visible,
    onClose,
    onSave,
}) => {
    const [label, setLabel] = useState('');

    const handleSave = () => {
        if (!label.trim()) {
            Alert.alert('Missing Information', 'Please enter a tag name');
            return;
        }

        onSave({
            label: label.trim(),
            icon: '', // Remove default icon
        });

        // Reset form
        setLabel('');

        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        onClose();
    };

    const handleClose = () => {
        setLabel('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
            transparent
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                {/* Backdrop for transparent modal effect on some platforms if needed, 
                    but here we use pageSheet or similar style */}

                <Box style={styles.content}>
                    {/* Header */}
                    <Box style={styles.header}>
                        <HStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                            <VStack align="center" gap="xs" style={{ flex: 1 }}>
                                <Text variant="h3">Add Tag</Text>
                                <Text variant="caption" color="textMuted">
                                    Categorize your profile or card
                                </Text>
                            </VStack>
                            <Box width={36} />
                        </HStack>
                    </Box>

                    <Box style={{ padding: spacing['2xl'] }}>
                        <VStack gap="lg">
                            <VStack gap="sm">
                                <Text variant="body" weight="semibold">Tag Name</Text>
                                <Box style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. Designer, Freelancer..."
                                        placeholderTextColor={colors.placeholder}
                                        value={label}
                                        onChangeText={setLabel}
                                        autoFocus
                                        maxLength={20}
                                        selectionColor={colors.dark}
                                    />
                                </Box>
                            </VStack>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSave}
                                activeOpacity={0.8}
                            >
                                <HStack gap="xs" align="center">
                                    <Ionicons name="add" size={20} color={colors.white} />
                                    <Text variant="button" color="white">
                                        Add Tag
                                    </Text>
                                </HStack>
                            </TouchableOpacity>
                        </VStack>
                    </Box>
                </Box>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    content: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopLeftRadius: radii['2xl'],
        borderTopRightRadius: radii['2xl'],
        paddingBottom: Platform.OS === 'ios' ? 40 : spacing['2xl'],
        ...shadows.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    header: {
        paddingTop: spacing.xl,
        paddingHorizontal: spacing['2xl'],
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    closeButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -spacing.sm,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: radii.full,
    },
    inputContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: radii.xl,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        ...shadows.sm,
    },
    input: {
        fontSize: 14,
        color: colors.dark,
        fontFamily: Platform.select({
            ios: 'System',
            android: 'Roboto',
            web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            default: 'sans-serif',
        }),
        padding: 0,
        fontWeight: '500',
    },
    saveButton: {
        height: 52,
        borderRadius: radii.pill,
        backgroundColor: colors.dark,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        ...shadows.md,
    },
});
