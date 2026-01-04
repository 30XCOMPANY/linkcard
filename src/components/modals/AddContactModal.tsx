/**
 * LinkCard Design System - Add Contact Modal
 * 
 * Modal for adding new contact methods:
 * - Email
 * - Phone
 * - Website
 * - Custom
 */

import React, { useState, useMemo } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Design System
import { Box, VStack, HStack, Text } from '@/src/design-system/primitives';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import { radii } from '@/src/design-system/tokens/radii';
import { shadows } from '@/src/design-system/tokens/shadows';
import { gradients } from '@/src/design-system/tokens/effects';
import { useCardStore } from '@/src/stores/cardStore';

type ContactType = 'email' | 'phone' | 'website' | 'custom';

interface ContactOption {
    type: ContactType;
    iconName: keyof typeof Ionicons.glyphMap;
    label: string;
    placeholder: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
}

const CONTACT_OPTIONS: ContactOption[] = [
    {
        type: 'email',
        iconName: 'mail',
        label: 'Email',
        placeholder: 'your@email.com',
        keyboardType: 'email-address',
    },
    {
        type: 'phone',
        iconName: 'call',
        label: 'Phone',
        placeholder: '+1 (555) 123-4567',
        keyboardType: 'phone-pad',
    },
    {
        type: 'website',
        iconName: 'globe-outline',
        label: 'Website',
        placeholder: 'https://yourwebsite.com',
        keyboardType: 'url',
    },
    {
        type: 'custom',
        iconName: 'link',
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
    const { currentGradient } = useCardStore();
    const [selectedType, setSelectedType] = useState<ContactType>('email');
    const [value, setValue] = useState('');
    const [customLabel, setCustomLabel] = useState('');

    const selectedOption = CONTACT_OPTIONS.find(opt => opt.type === selectedType) || CONTACT_OPTIONS[0];

    // Dynamic styles based on background
    const gradientKey = currentGradient as keyof typeof gradients;
    const gradientColors = gradients[gradientKey] || gradients.lightGlass;

    const isDarkBackground = useMemo(() => {
        if (typeof currentGradient === 'string' && currentGradient.includes('/')) return true;
        return ['black', 'ocean', 'purple', 'sunset', 'midnight'].includes(currentGradient as string);
    }, [currentGradient]);

    const textColor = isDarkBackground ? colors.white : colors.text;
    const placeholderColor = isDarkBackground ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';

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

        // Validate URL format
        if ((selectedType === 'website' || selectedType === 'custom') && !value.startsWith('http')) {
            Alert.alert('Invalid URL', 'URL should start with http:// or https://');
            return;
        }

        onSave({
            type: selectedType,
            icon: selectedOption.iconName,
            label: selectedType === 'custom' && customLabel.trim()
                ? customLabel.trim()
                : selectedOption.label,
            value: selectedType === 'email' ? `mailto:${value.trim()}`
                : selectedType === 'phone' ? `tel:${value.trim()}`
                    : value.trim(),
        });

        // Reset
        setValue('');
        setCustomLabel('');
        setSelectedType('email');

        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        onClose();
    };

    const handleClose = () => {
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
            {/* Background Gradient */}
            <LinearGradient
                colors={[...gradientColors]}
                locations={currentGradient === 'lightGlass' ? [0, 0.3, 0.7, 1] : undefined}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                {/* Header */}
                <Box style={styles.header}>
                    <HStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={[
                                styles.closeButton,
                                { backgroundColor: isDarkBackground ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)' }
                            ]}
                        >
                            <Ionicons name="close" size={24} color={textColor} />
                        </TouchableOpacity>
                        <VStack align="center" gap="xs">
                            <Text variant="h3" style={{ color: textColor }}>Add Contact</Text>
                            <Text variant="caption" style={{ color: isDarkBackground ? 'rgba(255,255,255,0.7)' : colors.textMuted }}>
                                QR code will be auto-generated
                            </Text>
                        </VStack>
                        <Box width={32} />
                    </HStack>
                </Box>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <VStack gap="2xl">
                        {/* Contact Type Selection - Glass Cards */}
                        <VStack gap="md">
                            <Text variant="body" weight="semibold" style={{ color: isDarkBackground ? 'rgba(255,255,255,0.8)' : colors.textMuted }}>
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
                                                    ? 'rgba(255, 255, 255, 0.4)'
                                                    : 'rgba(255, 255, 255, 0.15)',
                                                borderRadius: radii.xl,
                                                borderWidth: 1,
                                                borderColor: selectedType === option.type
                                                    ? 'rgba(255, 255, 255, 0.8)'
                                                    : 'rgba(255, 255, 255, 0.2)',
                                                ...shadows.sm,
                                            }}
                                        >
                                            <HStack gap="md" align="center">
                                                <Box
                                                    width={28}
                                                    height={28}
                                                    style={{
                                                        borderRadius: 12,
                                                        backgroundColor: selectedType === option.type
                                                            ? colors.dark
                                                            : 'rgba(255, 255, 255, 0.6)',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        ...shadows.sm,
                                                    }}
                                                >
                                                    <Ionicons
                                                        name={option.iconName}
                                                        size={16}
                                                        color={selectedType === option.type ? colors.white : textColor}
                                                    />
                                                </Box>

                                                <Box flex={1}>
                                                    <Text
                                                        variant="body"
                                                        weight="semibold"
                                                        style={{ color: textColor }}
                                                    >
                                                        {option.label}
                                                    </Text>
                                                </Box>
                                                {selectedType === option.type && (
                                                    <Ionicons name="checkmark-circle" size={20} color={textColor} />
                                                )}
                                            </HStack>
                                        </Box>
                                    </TouchableOpacity>
                                ))}
                            </VStack>
                        </VStack>

                        {/* Value Input */}
                        <VStack gap="sm">
                            <Text variant="body" weight="semibold" style={{ color: textColor }}>
                                {selectedOption.label}
                            </Text>

                            <Box style={styles.inputContainer}>
                                <TextInput
                                    style={[styles.input, { color: colors.dark }]} // Always dark text in inputs for readability
                                    placeholder={selectedOption.placeholder}
                                    placeholderTextColor="rgba(0,0,0,0.4)"
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
                                <Text variant="body" weight="semibold" style={{ color: textColor }}>
                                    Custom Label (Optional)
                                </Text>

                                <Box style={styles.inputContainer}>
                                    <TextInput
                                        style={[styles.input, { color: colors.dark }]}
                                        placeholder="e.g. Instagram, Twitter..."
                                        placeholderTextColor="rgba(0,0,0,0.4)"
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
                        style={[styles.saveButton, { backgroundColor: colors.dark }]}
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
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 20 : spacing['2xl'],
        paddingHorizontal: spacing['2xl'],
        paddingBottom: spacing.lg,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing['2xl'],
    },
    inputContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: radii.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        ...shadows.sm,
    },
    input: {
        fontSize: 14, // Reduced size for elegance
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
    footer: {
        padding: spacing['2xl'],
        paddingBottom: Platform.OS === 'ios' ? 40 : spacing['2xl'],
    },
    saveButton: {
        height: 52,
        borderRadius: radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
});
