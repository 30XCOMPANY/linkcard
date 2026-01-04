/**
 * LinkCard Design System - Add Block Modal (Simplified)
 * 
 * Full-screen modal for adding new highlight blocks with:
 * - Cover image upload
 * - Title input
 * - Description text area
 * - Link input
 * - Save button
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
    Image,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

// Design System
import { Box, VStack, HStack, Text } from '@/src/design-system/primitives';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import { radii } from '@/src/design-system/tokens/radii';
import { shadows } from '@/src/design-system/tokens/shadows';

interface AddBlockModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (block: {
        icon: string;
        title: string;
        description?: string;
        link?: string;
        coverImage?: string;
    }) => void;
}

export const AddBlockModal: React.FC<AddBlockModalProps> = ({
    visible,
    onClose,
    onSave,
}) => {
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');

    const handlePickImage = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Camera roll permission is needed to upload images');
                return;
            }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setCoverImage(result.assets[0].uri);
            if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        }
    };

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a title');
            return;
        }

        onSave({
            icon: '🎉', // Default icon
            title: title.trim(),
            description: description.trim() || undefined,
            link: link.trim() || undefined,
            coverImage: coverImage || undefined,
        });

        // Reset form
        setCoverImage(null);
        setTitle('');
        setDescription('');
        setLink('');

        onClose();
    };

    const handleClose = () => {
        // Reset form on close
        setCoverImage(null);
        setTitle('');
        setDescription('');
        setLink('');
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
                            <Ionicons name="chevron-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text variant="h3">Add Highlights</Text>
                        <TouchableOpacity onPress={handleSave} style={styles.moreButton}>
                            <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </HStack>
                </Box>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <VStack gap="3xl">
                        {/* Cover Image */}
                        <VStack gap="sm">
                            <HStack gap="sm" align="center">
                                <Box
                                    width={28}
                                    height={28}
                                    borderRadius="sm"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(0, 0, 0, 0.1)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        ...shadows.sm,
                                    }}
                                >
                                    <Ionicons name="image" size={16} color={colors.dark} />
                                </Box>
                                <Text variant="body" weight="semibold">
                                    Cover
                                </Text>
                            </HStack>

                            <TouchableOpacity
                                style={styles.coverImageContainer}
                                onPress={handlePickImage}
                                activeOpacity={0.7}
                            >
                                {coverImage ? (
                                    <>
                                        <Image source={{ uri: coverImage }} style={styles.coverImage} />
                                        <Box style={styles.editOverlay}>
                                            <Ionicons name="create-outline" size={20} color={colors.white} />
                                        </Box>
                                    </>
                                ) : (
                                    <VStack gap="sm" align="center" style={{ flex: 1, justifyContent: 'center' }}>
                                        <Box
                                            width={64}
                                            height={64}
                                            borderRadius="full"
                                            style={{
                                                backgroundColor: colors.card,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Ionicons name="images-outline" size={32} color={colors.textMuted} />
                                        </Box>
                                        <Text variant="caption" color="textMuted">
                                            Tap to upload cover image
                                        </Text>
                                    </VStack>
                                )}
                            </TouchableOpacity>
                        </VStack>

                        {/* Title */}
                        <VStack gap="sm">
                            <HStack gap="sm" align="center">
                                <Box
                                    width={28}
                                    height={28}
                                    borderRadius="sm"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(0, 0, 0, 0.1)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        ...shadows.sm,
                                    }}
                                >
                                    <Ionicons name="text" size={16} color={colors.dark} />
                                </Box>
                                <Text variant="body" weight="semibold">
                                    Title
                                </Text>
                            </HStack>

                            <Box style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter title..."
                                    placeholderTextColor={colors.placeholder}
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={50}
                                />
                            </Box>
                        </VStack>

                        {/* Description */}
                        <VStack gap="sm">
                            <HStack gap="sm" align="center">
                                <Box
                                    width={28}
                                    height={28}
                                    borderRadius="sm"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(0, 0, 0, 0.1)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        ...shadows.sm,
                                    }}
                                >
                                    <Ionicons name="document-text" size={16} color={colors.dark} />
                                </Box>
                                <Text variant="body" weight="semibold">
                                    Description
                                </Text>
                            </HStack>

                            <Box style={styles.textAreaContainer}>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="A personal manual for creative workers"
                                    placeholderTextColor={colors.placeholder}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={4}
                                    maxLength={200}
                                    textAlignVertical="top"
                                />
                            </Box>
                        </VStack>

                        {/* Link */}
                        <VStack gap="sm">
                            <HStack gap="sm" align="center">
                                <Box
                                    width={28}
                                    height={28}
                                    borderRadius="sm"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(0, 0, 0, 0.1)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        ...shadows.sm,
                                    }}
                                >
                                    <Ionicons name="link" size={16} color={colors.dark} />
                                </Box>
                                <Text variant="body" weight="semibold">
                                    Link
                                </Text>
                            </HStack>

                            <Box style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter link"
                                    placeholderTextColor={colors.placeholder}
                                    value={link}
                                    onChangeText={setLink}
                                    keyboardType="url"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </Box>
                        </VStack>
                    </VStack>
                </ScrollView>

                {/* Save Button */}
                <Box style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        activeOpacity={0.8}
                    >
                        <Text variant="button" color="white">
                            Save
                        </Text>
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
    moreButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: -spacing.sm,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing['2xl'],
    },
    coverImageContainer: {
        width: '100%',
        height: 200,
        borderRadius: radii.lg,
        backgroundColor: colors.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    editOverlay: {
        position: 'absolute',
        right: spacing.md,
        bottom: spacing.md,
        width: 36,
        height: 36,
        borderRadius: radii.full,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        backgroundColor: colors.card,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    textAreaContainer: {
        backgroundColor: colors.card,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 120,
    },
    input: {
        fontSize: 16,
        color: colors.text,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        padding: 0,
    },
    textArea: {
        fontSize: 16,
        color: colors.text,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        padding: 0,
        minHeight: 100,
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
