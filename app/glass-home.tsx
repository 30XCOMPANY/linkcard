/**
 * LinkCard Home Screen - Final Design
 * 
 * Layout:
 * 1. Avatar (click to toggle QR code)
 * 2. Name & Headline
 * 3. Tags (below headline - AI & Marketing, Company, Location)
 * 4. Contact Methods (LinkedIn + addable Email/Phone/etc)
 * 5. Highlights from LinkedIn
 * 6. Placeholder
 */

import React, { useState, useMemo } from 'react';
import {
    ScrollView,
    TouchableOpacity,
    Platform,
    Image,
    StyleSheet,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import QRCodeSVG from 'react-native-qrcode-svg';

// Design System
import { Box, VStack, HStack, Text } from '@/src/design-system/primitives';
import { GlassButton, GlassCard } from '@/src/design-system/patterns';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import { radii } from '@/src/design-system/tokens/radii';
import { shadows } from '@/src/design-system/tokens/shadows';
import { gradients } from '@/src/design-system/tokens/effects';

// Store
import { useCardStore } from '@/src/stores/cardStore';

// Modals
import { ShareMenu } from '@/src/components/modals/ShareMenu';
import { BackgroundPicker } from '@/src/components/modals/BackgroundPicker';
import { AddBlockModal } from '@/src/components/modals/AddBlockModal';

type ViewMode = 'view' | 'edit';
type GradientKey = keyof typeof gradients;
type ContactType = 'linkedin' | 'email' | 'phone' | 'website' | 'custom';

interface ContactMethod {
    id: string;
    type: ContactType;
    icon: string;
    label: string;
    value: string;
}

interface Highlight {
    id: string;
    title: string;
    summary: string;
    date?: string;
    source: 'linkedin' | 'custom';
}

export default function GlassHomeScreen() {
    const router = useRouter();
    const { card } = useCardStore();

    // State
    const [mode, setMode] = useState<ViewMode>('view');
    const [shareMenuVisible, setShareMenuVisible] = useState(false);
    const [bgPickerVisible, setBgPickerVisible] = useState(false);
    const [addBlockVisible, setAddBlockVisible] = useState(false);
    const [currentGradient, setCurrentGradient] = useState<GradientKey>('lightGlass');
    const [showQR, setShowQR] = useState(false);
    const [selectedContact, setSelectedContact] = useState<ContactType>('linkedin');
    const [customHighlights, setCustomHighlights] = useState<Highlight[]>([]);

    // User-added contact methods
    const [userContacts, setUserContacts] = useState<ContactMethod[]>([]);

    if (!card) {
        router.replace('/onboarding');
        return null;
    }

    const { profile } = card;

    // All contact methods (LinkedIn is always first)
    const allContacts = useMemo<ContactMethod[]>(() => {
        const contacts: ContactMethod[] = [
            {
                id: 'linkedin',
                type: 'linkedin',
                icon: '💼',
                label: 'LinkedIn',
                value: profile.url || '',
            },
        ];

        // Add user-defined contacts
        if (profile.email) {
            contacts.push({
                id: 'email',
                type: 'email',
                icon: '📧',
                label: 'Email',
                value: `mailto:${profile.email}`,
            });
        }

        if (profile.phone) {
            contacts.push({
                id: 'phone',
                type: 'phone',
                icon: '📱',
                label: 'Phone',
                value: `tel:${profile.phone}`,
            });
        }

        if (profile.website) {
            contacts.push({
                id: 'website',
                type: 'website',
                icon: '🌐',
                label: 'Website',
                value: profile.website,
            });
        }

        // Merge with custom user contacts
        return [...contacts, ...userContacts];
    }, [profile, userContacts]);

    // QR Code value and label based on selected contact
    const qrCodeData = useMemo(() => {
        const contact = allContacts.find(c => c.type === selectedContact);
        if (!contact) {
            return {
                value: profile.url,
                label: 'Scan to connect on LinkedIn',
            };
        }

        switch (contact.type) {
            case 'linkedin':
                return { value: contact.value, label: 'Scan to connect on LinkedIn' };
            case 'email':
                return { value: contact.value, label: 'Scan to email' };
            case 'phone':
                return { value: contact.value, label: 'Scan to call' };
            case 'website':
                return { value: contact.value, label: 'Visit website' };
            case 'custom':
                return { value: contact.value, label: 'Scan QR code' };
            default:
                return { value: profile.url, label: 'Scan to connect on LinkedIn' };
        }
    }, [selectedContact, allContacts, profile.url]);

    // Auto-generate tags from LinkedIn
    const tags = useMemo(() => {
        const result = [];

        // AI & Marketing tag (from LinkedIn summary/analysis)
        if (profile.headline?.toLowerCase().includes('ai') ||
            profile.headline?.toLowerCase().includes('marketing')) {
            result.push({ id: 'industry', icon: '🚀', label: 'AI & Marketing' });
        }

        if (profile.company) {
            result.push({ id: 'company', icon: '💼', label: profile.company });
        }

        if (profile.location) {
            result.push({ id: 'location', icon: '📍', label: profile.location });
        }

        return result;
    }, [profile]);

    // Mock LinkedIn highlights
    const linkedInHighlights = useMemo<Highlight[]>(() => {
        if (profile.publications && profile.publications.length > 0) {
            return profile.publications.slice(0, 3).map((pub, index) => ({
                id: `linkedin-${index}`,
                title: pub.title,
                summary: pub.description || 'AI-generated summary coming soon...',
                date: pub.date,
                source: 'linkedin' as const,
            }));
        }
        return [];
    }, [profile.publications]);

    const allHighlights = useMemo(() => {
        return [...linkedInHighlights, ...customHighlights];
    }, [linkedInHighlights, customHighlights]);

    // Handlers
    const handleToggleMode = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setMode(mode === 'view' ? 'edit' : 'view');
    };

    const handleSave = () => {
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setMode('view');
        Alert.alert('Success', 'Your changes have been saved');
    };

    const handleShare = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setShareMenuVisible(true);
    };

    const handleShareCard = () => {
        Alert.alert('Share Card', 'Generating beautiful card image...');
        router.push('/share');
    };

    const handleDigitalCard = () => {
        Alert.alert('Digital Business Card', 'Generating vCard file...');
    };

    const handleAppleWallet = () => {
        Alert.alert('Apple Wallet', 'Adding to wallet...');
    };

    const handleAddHighlight = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setAddBlockVisible(true);
    };

    const handleSaveHighlight = (block: { icon: string; title: string; description?: string }) => {
        const newHighlight: Highlight = {
            id: Date.now().toString(),
            title: block.title,
            summary: block.description || '',
            source: 'custom',
        };
        setCustomHighlights([...customHighlights, newHighlight]);
        Alert.alert('Success', `Added "${block.title}"`);
    };

    const handleDeleteHighlight = (id: string) => {
        const highlight = customHighlights.find(h => h.id === id);
        setCustomHighlights(customHighlights.filter(h => h.id !== id));
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Deleted', `Removed "${highlight?.title}"`);
    };

    const handleEditAvatar = () => {
        if (mode !== 'edit') return;
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Alert.alert('Change Avatar', 'Open image picker...');
    };

    const handleToggleQR = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setShowQR(!showQR);
    };

    const handleSelectContact = (type: ContactType) => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setSelectedContact(type);
    };

    const handleAddContact = () => {
        Alert.alert('Add Contact Method', 'Choose a contact method to add');
    };

    return (
        <Box flex={1}>
            {/* Background Gradient */}
            <LinearGradient
                colors={gradients[currentGradient] as any[]}
                locations={currentGradient === 'lightGlass' ? [0, 0.3, 0.7, 1] : undefined}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: spacing['2xl'], paddingBottom: 120 }}
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <Box pt="6xl" pb="xl" style={{ alignItems: 'flex-end' }}>
                        <HStack gap="sm">
                            {mode === 'edit' && (
                                <TouchableOpacity
                                    style={styles.headerButton}
                                    onPress={() => setBgPickerVisible(true)}
                                >
                                    <Ionicons name="color-palette-outline" size={22} color={colors.text} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={() => router.push('/settings')}
                            >
                                <Ionicons name="settings-outline" size={22} color={colors.text} />
                            </TouchableOpacity>
                        </HStack>
                    </Box>
                </Animated.View>

                {/* Avatar & Name Section */}
                <Animated.View entering={FadeInUp.delay(200).springify()}>
                    <VStack gap="lg" align="center" style={{ marginBottom: spacing.xl }}>
                        {/* Avatar with QR Toggle */}
                        <HStack gap="md" align="center" style={{ justifyContent: 'center' }}>
                            <TouchableOpacity
                                onPress={mode === 'edit' ? handleEditAvatar : handleToggleQR}
                                activeOpacity={0.8}
                            >
                                <Box style={{ position: 'relative' }}>
                                    {profile.photoUrl ? (
                                        <Image
                                            source={{ uri: profile.photoUrl }}
                                            style={styles.avatarImage}
                                        />
                                    ) : (
                                        <Box style={styles.avatarPlaceholder}>
                                            <Text variant="displayMedium" color="white">
                                                {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                            </Text>
                                        </Box>
                                    )}

                                    {mode === 'edit' ? (
                                        <Box style={styles.editAvatarButton}>
                                            <Ionicons name="camera" size={16} color={colors.white} />
                                        </Box>
                                    ) : (
                                        <Box style={styles.qrIndicator}>
                                            <Ionicons name="qr-code" size={16} color={colors.white} />
                                        </Box>
                                    )}
                                </Box>
                            </TouchableOpacity>

                            {/* QR Code (toggleable) */}
                            {showQR && mode !== 'edit' && (
                                <Animated.View entering={FadeIn} exiting={FadeOut}>
                                    <GlassCard padding="md" borderRadius="xl">
                                        <VStack gap="xs" align="center">
                                            <QRCodeSVG
                                                value={qrCodeData.value}
                                                size={90}
                                                backgroundColor="#FFFFFF"
                                                color="#000000"
                                            />
                                            <Text variant="caption" color="textMuted" style={{ fontSize: 10 }}>
                                                {qrCodeData.label}
                                            </Text>
                                        </VStack>
                                    </GlassCard>
                                </Animated.View>
                            )}
                        </HStack>

                        {/* Name & Headline */}
                        <VStack gap="xs" align="center" style={{ maxWidth: 320 }}>
                            <Text variant="h1" align="center">
                                {profile.name}
                            </Text>
                            {profile.headline && (
                                <Text variant="body" color="textMuted" align="center" numberOfLines={2}>
                                    {profile.headline}
                                </Text>
                            )}
                        </VStack>

                        {/* Tags (below headline) */}
                        <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginTop: spacing.sm }}>
                            {tags.map((tag) => (
                                <TouchableOpacity
                                    key={tag.id}
                                    disabled={mode !== 'edit'}
                                    activeOpacity={0.7}
                                >
                                    <Box
                                        px="md"
                                        py="xs"
                                        borderRadius="pill"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            borderWidth: 1,
                                            borderColor: 'rgba(255, 255, 255, 1)',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: spacing.xs,
                                            ...shadows.xs,
                                        }}
                                    >
                                        <Text variant="caption" style={{ fontSize: 10 }}>{tag.icon}</Text>
                                        <Text variant="caption" weight="medium" style={{ fontSize: 11 }}>
                                            {tag.label}
                                        </Text>
                                        {mode === 'edit' && (
                                            <Ionicons name="close-circle" size={12} color={colors.textMuted} />
                                        )}
                                    </Box>
                                </TouchableOpacity>
                            ))}

                            {mode === 'edit' && (
                                <TouchableOpacity>
                                    <Box
                                        px="md"
                                        py="xs"
                                        borderRadius="pill"
                                        style={{
                                            backgroundColor: colors.white,
                                            borderWidth: 1,
                                            borderColor: colors.dark,
                                            borderStyle: 'dashed',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: spacing.xs,
                                        }}
                                    >
                                        <Ionicons name="add" size={12} color={colors.dark} />
                                        <Text variant="caption" weight="medium" style={{ color: colors.dark, fontSize: 11 }}>
                                            Add Tag
                                        </Text>
                                    </Box>
                                </TouchableOpacity>
                            )}
                        </Box>
                    </VStack>
                </Animated.View>

                {/* Contact Methods */}
                <Animated.View entering={FadeInUp.delay(250).springify()}>
                    <VStack gap="sm" style={{ marginBottom: spacing['2xl'], marginTop: spacing.xl }}>
                        {/* Contact items */}
                        {allContacts.map((contact) => (
                            <TouchableOpacity
                                key={contact.id}
                                onPress={() => handleSelectContact(contact.type)}
                                activeOpacity={0.7}
                            >
                                <HStack
                                    gap="md"
                                    align="center"
                                    px="md"
                                    py="sm"
                                    style={{
                                        backgroundColor: selectedContact === contact.type
                                            ? 'rgba(255, 255, 255, 0.95)'
                                            : 'rgba(255, 255, 255, 0.5)',
                                        borderRadius: radii.lg,
                                        borderWidth: 1,
                                        borderColor: selectedContact === contact.type
                                            ? colors.dark
                                            : 'rgba(255, 255, 255, 0.8)',
                                    }}
                                >
                                    <Text variant="body">{contact.icon}</Text>
                                    <Box flex={1}>
                                        <Text
                                            variant="body"
                                            weight={selectedContact === contact.type ? 'semibold' : 'regular'}
                                        >
                                            {contact.label}
                                        </Text>
                                    </Box>
                                    {selectedContact === contact.type && (
                                        <Ionicons name="checkmark-circle" size={20} color={colors.dark} />
                                    )}
                                    {mode === 'edit' && contact.type !== 'linkedin' && (
                                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                                    )}
                                </HStack>
                            </TouchableOpacity>
                        ))}

                        {/* Add Contact Button (only in edit mode) */}
                        {mode === 'edit' && (
                            <TouchableOpacity onPress={handleAddContact} activeOpacity={0.7}>
                                <HStack
                                    gap="md"
                                    align="center"
                                    px="md"
                                    py="sm"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        borderRadius: radii.lg,
                                        borderWidth: 1,
                                        borderColor: colors.dark,
                                        borderStyle: 'dashed',
                                    }}
                                >
                                    <Ionicons name="add-circle-outline" size={20} color={colors.dark} />
                                    <Text variant="body" weight="medium" style={{ color: colors.dark }}>
                                        Add Contact Method
                                    </Text>
                                </HStack>
                            </TouchableOpacity>
                        )}
                    </VStack>
                </Animated.View>

                {/* Highlights Section */}
                <Animated.View entering={FadeInUp.delay(350).springify()}>
                    <VStack gap="md">
                        <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text variant="body" weight="semibold">
                                Highlights
                            </Text>
                            {mode === 'edit' && (
                                <TouchableOpacity onPress={handleAddHighlight}>
                                    <HStack gap="xs" align="center">
                                        <Ionicons name="add-circle" size={20} color={colors.dark} />
                                        <Text variant="label" weight="semibold" style={{ color: colors.dark }}>
                                            Add Highlight
                                        </Text>
                                    </HStack>
                                </TouchableOpacity>
                            )}
                        </HStack>

                        {/* LinkedIn Highlights */}
                        {allHighlights.map((highlight) => (
                            <HStack key={highlight.id} gap="md" align="center">
                                {mode === 'edit' && highlight.source === 'custom' && (
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => handleDeleteHighlight(highlight.id)}
                                    >
                                        <Ionicons name="remove" size={20} color={colors.text} />
                                    </TouchableOpacity>
                                )}
                                <Box flex={1}>
                                    <GlassCard padding="lg" borderRadius="xl">
                                        <VStack gap="sm">
                                            <HStack gap="xs" align="center" style={{ justifyContent: 'space-between' }}>
                                                <Text variant="body" weight="semibold" style={{ flex: 1 }}>
                                                    {highlight.title}
                                                </Text>
                                                {highlight.source === 'linkedin' && (
                                                    <Box
                                                        px="sm"
                                                        py="xs"
                                                        borderRadius="pill"
                                                        style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                                    >
                                                        <Text variant="caption" style={{ color: colors.info, fontSize: 10 }}>
                                                            LinkedIn
                                                        </Text>
                                                    </Box>
                                                )}
                                            </HStack>
                                            <Text variant="caption" color="textMuted" numberOfLines={3}>
                                                {highlight.summary}
                                            </Text>
                                            {highlight.date && (
                                                <Text variant="caption" color="textMuted" style={{ fontSize: 11 }}>
                                                    {highlight.date}
                                                </Text>
                                            )}
                                        </VStack>
                                    </GlassCard>
                                </Box>
                            </HStack>
                        ))}

                        {/* Placeholder */}
                        <TouchableOpacity
                            onPress={mode === 'edit' ? handleAddHighlight : undefined}
                            disabled={mode !== 'edit'}
                            activeOpacity={0.7}
                        >
                            <GlassCard padding="lg" borderRadius="xl">
                                <VStack gap="sm" align="center" style={{ paddingVertical: spacing.lg }}>
                                    <Box
                                        width={48}
                                        height={48}
                                        borderRadius="full"
                                        style={{
                                            backgroundColor: colors.card,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Ionicons name="add-circle-outline" size={24} color={colors.textMuted} />
                                    </Box>
                                    <Text variant="caption" color="textMuted">
                                        {mode === 'edit' ? 'Tap to add your first highlight' : 'No more highlights'}
                                    </Text>
                                </VStack>
                            </GlassCard>
                        </TouchableOpacity>
                    </VStack>
                </Animated.View>
            </ScrollView>

            {/* Floating Action Buttons */}
            <Box style={styles.floatingActions}>
                {mode === 'view' ? (
                    <HStack gap="md">
                        <Box flex={1}>
                            <GlassButton
                                onPress={handleToggleMode}
                                variant="glass"
                                size="lg"
                                fullWidth
                                icon="create-outline"
                            >
                                Edit Home
                            </GlassButton>
                        </Box>
                        <Box flex={1}>
                            <GlassButton
                                onPress={handleShare}
                                variant="glass"
                                size="lg"
                                fullWidth
                                icon="share-social-outline"
                            >
                                Share
                            </GlassButton>
                        </Box>
                    </HStack>
                ) : (
                    <HStack gap="md">
                        <Box flex={1}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleToggleMode}
                            >
                                <Text variant="button" color="text">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </Box>
                        <Box flex={2}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSave}
                            >
                                <Ionicons name="checkmark" size={20} color={colors.white} style={{ marginRight: spacing.xs }} />
                                <Text variant="button" color="white">
                                    Save
                                </Text>
                            </TouchableOpacity>
                        </Box>
                    </HStack>
                )}
            </Box>

            {/* Modals */}
            <ShareMenu
                visible={shareMenuVisible}
                onClose={() => setShareMenuVisible(false)}
                onShareCard={handleShareCard}
                onDigitalCard={handleDigitalCard}
                onAppleWallet={handleAppleWallet}
            />

            <BackgroundPicker
                visible={bgPickerVisible}
                onClose={() => setBgPickerVisible(false)}
                currentGradient={currentGradient}
                onSelect={setCurrentGradient}
            />

            <AddBlockModal
                visible={addBlockVisible}
                onClose={() => setAddBlockVisible(false)}
                onSave={handleSaveHighlight}
            />
        </Box>
    );
}

const styles = StyleSheet.create({
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: radii.full,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: radii.full,
        borderWidth: 4,
        borderColor: colors.white,
        backgroundColor: colors.card,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: radii.full,
        borderWidth: 4,
        borderColor: colors.white,
        backgroundColor: colors.blue,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: radii.full,
        backgroundColor: colors.blue,
        borderWidth: 3,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
    qrIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: radii.full,
        backgroundColor: colors.dark,
        borderWidth: 3,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: radii.full,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
        borderWidth: 0.5,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    floatingActions: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 40 : spacing['2xl'],
        left: spacing['2xl'],
        right: spacing['2xl'],
    },
    cancelButton: {
        height: 52,
        borderRadius: radii.pill,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    saveButton: {
        height: 52,
        borderRadius: radii.pill,
        backgroundColor: colors.dark,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
});
