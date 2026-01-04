/**
 * LinkCard Design System - Add Contact Modal
 * 
 * Modal for adding new contact methods:
 * - Email
 * - Phone
 * - Website
 * - Custom
 */

import React, { useState } from 'react';
import {
    Modal,
    TouchableOpacity,
    StyleSheet,
    Platform,
    TextInput,
    ScrollView,
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

type ContactType = 'email' | 'phone' | 'website' | 'custom';

interface ContactOption {
    type: ContactType;
    iconName: keyof typeof Ionicons.glyphMap;
    color: string;
    label: string;
    placeholder: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
}

const CONTACT_OPTIONS: ContactOption[] = [
    {
        type: 'email',
        iconName: 'mail',
        color: 'rgba(0, 0, 0, 0.05)',
        label: 'Email',
        placeholder: 'your@email.com',
        keyboardType: 'email-address',
    },
    {
        type: 'phone',
        iconName: 'call',
        color: 'rgba(0, 0, 0, 0.05)',
        label: 'Phone',
        placeholder: '+1 (555) 123-4567',
        keyboardType: 'phone-pad',
    },
    {
        type: 'website',
        iconName: 'globe-outline',
        color: 'rgba(0, 0, 0, 0.05)',
        label: 'Website',
        placeholder: 'https://yourwebsite.com',
        keyboardType: 'url',
    },
    {
        type: 'custom',
        iconName: 'link',
        color: 'rgba(0, 0, 0, 0.05)',
        label: 'Custom Link',
        placeholder: 'https://...',
        keyboardType: 'url',
    },
];

interface AddContactModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (contact: {
        type: ContactType;
        icon: string;
        label: string;
        value: string;
    }) => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
    visible,
    onClose,
    onSave,
}) => {
    const [selectedType, setSelectedType] = useState<ContactType>('email');
    const [value, setValue] = useState('');
    const [customLabel, setCustomLabel] = useState('');

    const selectedOption = CONTACT_OPTIONS.find(opt => opt.type === selectedType) || CONTACT_OPTIONS[0];

    const handleSelectType = (type: ContactType) => {
        setSelectedType(type);
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handleSave = () => {
        if (!value.trim()) {
            Alert.alert('Missing Information', `Please enter your ${selectedOption.label.toLowerCase()}`);
            return;
        }

        // Validate email format
        if (selectedType === 'email' && !value.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }

        // Validate URL format for website and custom
        if ((selectedType === 'website' || selectedType === 'custom') && !value.startsWith('http')) {
            Alert.alert('Invalid URL', 'URL should start with http:// or https://');
            return;
        }

        onSave({
            type: selectedType,
            icon: selectedOption.iconName, // Store icon name instead of emoji
            label: selectedType === 'custom' && customLabel.trim()
                ? customLabel.trim()
                : selectedOption.label,
            value: selectedType === 'email' ? `mailto:${value.trim()}`
                : selectedType === 'phone' ? `tel:${value.trim()}`
                    : value.trim(),
        });

        // Reset form
        setValue('');
        setCustomLabel('');
        setSelectedType('email');

        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        onClose();
    };

    const handleClose = () => {
        // Reset form on close
        setValue('');
        setCustomLabel('');
        setSelectedType('email');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                {/* Header */}
                <Box style={styles.header}>
                    <HStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <VStack align="center" gap="xs">
                            <Text variant="h3">Add Contact</Text>
                            <Text variant="caption" color="textMuted" style={{ opacity: 0.6 }}>
                                QR code will be auto-generated
                            </Text>
                        </VStack>
                        <Box width={40} />
                    </HStack>
                </Box>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <VStack gap="3xl">
                        {/* Contact Type Selection */}
                        <VStack gap="md">
                            <Text variant="body" weight="semibold" color="textMuted">
                                Select Type
                            </Text>

                            <VStack gap="sm">
                                {CONTACT_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.type}
                                        onPress={() => handleSelectType(option.type)}
                                        activeOpacity={0.7}
                                    >
                                        <Box
                                            px="lg"
                                            py="md"
                                            style={{
                                                backgroundColor: selectedType === option.type
                                                    ? 'rgba(0, 0, 0, 0.05)'
                                                    : 'transparent',
                                                borderRadius: radii.lg,
                                                borderWidth: 1,
                                                borderColor: selectedType === option.type
                                                    ? 'rgba(0, 0, 0, 0.1)'
                                                    : 'transparent',
                                            }}
                                        >
                                            <HStack gap="md" align="center">
                                                <Box
                                                    width={36}
                                                    height={36}
                                                    borderRadius="md"
                                                    style={{
                                                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Ionicons name={option.iconName} size={18} color={colors.text} />
                                                </Box>

                                                <Box flex={1}>
                                                    <Text
                                                        variant="body"
                                                        weight={selectedType === option.type ? 'semibold' : 'regular'}
                                                    >
                                                        {option.label}
                                                    </Text>
                                                </Box>
                                                {selectedType === option.type && (
                                                    <Ionicons name="checkmark-circle" size={20} color={colors.text} />
                                                )}
                                            </HStack>
                                        </Box>
                                    </TouchableOpacity>
                                ))}
                            </VStack>
                        </VStack>

                        {/* Value Input */}
                        <VStack gap="sm">
                            <HStack gap="sm" align="center">
                                <Box
                                    width={24}
                                    height={24}
                                    borderRadius="sm"
                                    style={{
                                        backgroundColor: selectedOption.color,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Ionicons name={selectedOption.iconName} size={14} color={colors.text} />
                                </Box>
                                <Text variant="body" weight="semibold">
                                    {selectedOption.label}
                                </Text>
                            </HStack>

                            <Box style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={selectedOption.placeholder}
                                    placeholderTextColor={colors.placeholder}
                                    value={value}
                                    onChangeText={setValue}
                                    keyboardType={selectedOption.keyboardType}
                                    autoCapitalize={selectedType === 'email' ? 'none' : 'sentences'}
                                    autoCorrect={false}
                                />
                            </Box>
                        </VStack>

                        {/* Custom Label (only for custom type) */}
                        {selectedType === 'custom' && (
                            <VStack gap="sm">
                                <HStack gap="sm" align="center">
                                    <Box
                                        width={24}
                                        height={24}
                                        borderRadius="sm"
                                        style={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Ionicons name="text-outline" size={14} color={colors.text} />
                                    </Box>
                                    <Text variant="body" weight="semibold">
                                        Custom Label
                                    </Text>
                                    <Text variant="caption" color="textMuted">
                                        (Optional)
                                    </Text>
                                </HStack>

                                <Box style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. Instagram, Twitter..."
                                        placeholderTextColor={colors.placeholder}
                                        value={customLabel}
                                        onChangeText={setCustomLabel}
                                        maxLength={20}
                                    />
                                </Box>
                            </VStack>
                        )}
                    </VStack>
                </ScrollView>

                {/* Save Button */}
                <Box style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        activeOpacity={0.8}
                    >
                        <HStack gap="xs" align="center">
                            <Ionicons name="add-circle" size={20} color={colors.white} />
                            <Text variant="button" color="white">
                                Add Contact
                            </Text>
                        </HStack>
                    </TouchableOpacity>
                </Box>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : spacing['2xl'],
        paddingHorizontal: spacing['2xl'],
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -spacing.sm,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing['2xl'],
    },
    inputContainer: {
        backgroundColor: colors.card,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    input: {
        fontSize: 16,
        color: colors.text,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        padding: 0,
    },
    footer: {
        padding: spacing['2xl'],
        paddingBottom: Platform.OS === 'ios' ? 34 : spacing['2xl'],
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    saveButton: {
        height: 52,
        borderRadius: radii.pill,
        backgroundColor: colors.dark,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
});
