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

import React, { useState, useMemo, useEffect } from 'react';
import {
    ScrollView,
    TouchableOpacity,
    Platform,
    Image,
    StyleSheet,
    Alert,
    Share,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
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
import { AddContactModal } from '@/src/components/modals/AddContactModal';
import { AddTagModal } from '@/src/components/modals/AddTagModal';

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
    const { card, currentGradient, setCurrentGradient } = useCardStore();

    // State
    const [mode, setMode] = useState<ViewMode>('view');
    const [shareMenuVisible, setShareMenuVisible] = useState(false);
    const [bgPickerVisible, setBgPickerVisible] = useState(false);
    const [addBlockVisible, setAddBlockVisible] = useState(false);
    const [addContactVisible, setAddContactVisible] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [selectedContact, setSelectedContact] = useState<ContactType>('linkedin');
    const [customHighlights, setCustomHighlights] = useState<Highlight[]>([]);

    // Custom Tags
    const [addTagVisible, setAddTagVisible] = useState(false);
    const [customTags, setCustomTags] = useState<{ id: string, label: string, icon: string }[]>([]);

    // User-added contact methods
    const [userContacts, setUserContacts] = useState<ContactMethod[]>([]);

    const profile = card?.profile;

    // Dynamic Text Colors based on background
    const isDarkBackground = useMemo(() => {
        if (typeof currentGradient === 'string' && currentGradient.includes('/')) {
            return true; // Default to light text for custom images
        }
        return ['black', 'ocean', 'purple', 'sunset', 'midnight'].includes(currentGradient as string);
    }, [currentGradient]);

    const textColor = isDarkBackground ? colors.white : colors.text;
    const secondaryTextColor = isDarkBackground ? 'rgba(255, 255, 255, 0.7)' : colors.textMuted;

    // All contact methods (LinkedIn is always first)
    const allContacts = useMemo<ContactMethod[]>(() => {
        if (!profile) return [];

        const contacts: ContactMethod[] = [
            {
                id: 'linkedin',
                type: 'linkedin',
                icon: 'logo-linkedin',
                label: 'LinkedIn',
                value: profile.url || '',
            },
        ];

        // Add user-defined contacts
        if (profile.email) {
            contacts.push({
                id: 'email',
                type: 'email',
                icon: 'mail',
                label: 'Email',
                value: `mailto:${profile.email}`,
            });
        }

        if (profile.phone) {
            contacts.push({
                id: 'phone',
                type: 'phone',
                icon: 'call',
                label: 'Phone',
                value: `tel:${profile.phone}`,
            });
        }

        if (profile.website) {
            contacts.push({
                id: 'website',
                type: 'website',
                icon: 'globe',
                label: 'Website',
                value: profile.website,
            });
        }

        // Merge with custom user contacts
        return [...contacts, ...userContacts];
    }, [profile, userContacts]);

    // QR Code value and label based on selected contact
    const qrCodeData = useMemo(() => {
        if (!profile) {
            return {
                value: '',
                label: 'Scan to connect on LinkedIn',
            };
        }

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
    }, [selectedContact, allContacts, profile]);

    // Auto-generate tags from LinkedIn
    const tags = useMemo(() => {
        if (!profile) return [];

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

        return [...result, ...customTags];
    }, [profile, customTags]);

    // Mock LinkedIn highlights
    const linkedInHighlights = useMemo<Highlight[]>(() => {
        if (!profile || !profile.publications || profile.publications.length === 0) {
            return [];
        }

        return profile.publications.slice(0, 3).map((pub, index) => ({
            id: `linkedin-${index}`,
            title: pub.title,
            summary: pub.description || 'AI-generated summary coming soon...',
            date: pub.date,
            source: 'linkedin' as const,
        }));
    }, [profile]);

    const allHighlights = useMemo(() => {
        return [...linkedInHighlights, ...customHighlights];
    }, [linkedInHighlights, customHighlights]);

    // Redirect to onboarding if no card exists (after all hooks)
    if (!card || !profile) {
        return <Redirect href="/onboarding" />;
    }

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

    const handleShareLink = async () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        const username = profile?.username || profile?.name?.replace(/\s+/g, '').toLowerCase() || 'user';
        const url = `https://linkcard.app/u/${username}`;

        try {
            await Share.share({
                message: `Check out my digital business card: ${url}`,
                url: url, // iOS
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
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

    const handleEditAvatar = async () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photos to change your avatar.');
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            // TODO: Upload image to server and update profile
            // For now, just show success
            Alert.alert('Success', 'Avatar updated! (Image upload to be implemented)');
            console.log('Selected image:', result.assets[0].uri);
        }
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

        // If clicking LinkedIn
        if (type === 'linkedin') {
            // If already selected, toggle QR code
            if (selectedContact === 'linkedin') {
                setShowQR(!showQR);
            } else {
                // If selecting for first time, show QR code
                setSelectedContact(type);
                setShowQR(true);
            }
        } else {
            // Other contacts just select
            setSelectedContact(type);
        }
    };

    const handleAddContact = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setAddContactVisible(true);
    };

    const handleSaveContact = (contact: { type: ContactType; icon: string; label: string; value: string }) => {
        const newContact: ContactMethod = {
            id: Date.now().toString(),
            ...contact,
        };
        setUserContacts([...userContacts, newContact]);
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Success', `Added contact: ${contact.label}`);
    };

    const handleDeleteContact = (id: string) => {
        const contact = userContacts.find(c => c.id === id);
        if (!contact) return;

        Alert.alert(
            'Delete Contact',
            `Are you sure you want to delete "${contact.label}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setUserContacts(userContacts.filter(c => c.id !== id));
                        if (Platform.OS !== 'web') {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }
                    },
                },
            ]
        );
    };

    return (
        <Box flex={1}>
            {/* Background Gradient or Image */}
            {(gradients[currentGradient as GradientKey]) ? (
                <LinearGradient
                    colors={[...gradients[currentGradient as GradientKey]]}
                    locations={currentGradient === 'lightGlass' ? [0, 0.3, 0.7, 1] : undefined}
                    style={StyleSheet.absoluteFill}
                />
            ) : (
                <Image
                    source={{ uri: currentGradient }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                />
            )}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: spacing['3xl'], paddingBottom: 120 }}
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
                                    <Ionicons name="color-palette-outline" size={22} color={textColor} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={() => router.push('/settings')}
                            >
                                <Ionicons name="settings-outline" size={22} color={textColor} />
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

                            {/* QR Code (toggleable) - Circular and same size as avatar */}
                            {showQR && mode !== 'edit' && (
                                <Animated.View entering={FadeIn.springify()} exiting={FadeOut.springify()}>
                                    <Box style={styles.qrCodeContainer}>
                                        <QRCodeSVG
                                            value={qrCodeData.value}
                                            size={80}
                                            backgroundColor="#FFFFFF"
                                            color="#000000"
                                        />
                                    </Box>
                                </Animated.View>
                            )}
                        </HStack>

                        {/* Name & Headline */}
                        <VStack gap="xs" align="center" style={{ maxWidth: 320 }}>
                            <Text variant="h1" align="center" style={{ color: textColor }}>
                                {profile.name}
                            </Text>
                            {profile.headline && (
                                <Text variant="body" align="center" numberOfLines={2} style={{ color: secondaryTextColor }}>
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
                                            ...shadows.sm,
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
                                <TouchableOpacity onPress={() => setAddTagVisible(true)}>
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

                {/* Contact Information - Horizontal Tabs */}
                <Animated.View entering={FadeInUp.delay(250).springify()}>
                    <VStack gap="md" style={{ marginBottom: spacing['2xl'], marginTop: spacing.xl }}>
                        <HStack gap="xs" align="center" style={{ justifyContent: 'space-between' }}>
                            <Text variant="label" weight="semibold" style={{ fontSize: 13, letterSpacing: 0.5, color: secondaryTextColor }}>
                                CONTACT INFORMATION
                            </Text>
                            {mode === 'edit' && (
                                <TouchableOpacity onPress={handleAddContact} activeOpacity={0.7}>
                                    <HStack gap="xs" align="center">
                                        <Ionicons name="add-circle" size={20} color={colors.dark} />
                                        <Text variant="label" weight="semibold" style={{ color: colors.dark }}>
                                            Add
                                        </Text>
                                    </HStack>
                                </TouchableOpacity>
                            )}
                        </HStack>

                        <GlassCard padding="lg" borderRadius="xl">
                            {/* Horizontal Scrollable Contact Tabs */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: spacing.lg, paddingVertical: spacing.sm }}
                            >
                                {allContacts.map((contact) => {
                                    const isSelected = selectedContact === contact.type;
                                    return (
                                        <TouchableOpacity
                                            key={contact.id}
                                            onPress={() => handleSelectContact(contact.type)}
                                            activeOpacity={0.7}
                                        >
                                            <VStack gap="sm" align="center" style={{ minWidth: 64 }}>
                                                {/* Glass icon button */}
                                                <Box
                                                    style={{
                                                        width: 64,
                                                        height: 64,
                                                        borderRadius: 24,
                                                        backgroundColor: isSelected
                                                            ? 'rgba(255, 255, 255, 0.9)'
                                                            : 'rgba(255, 255, 255, 0.5)',
                                                        borderWidth: 1,
                                                        borderColor: isSelected
                                                            ? 'rgba(255, 255, 255, 1)'
                                                            : 'rgba(255, 255, 255, 0.4)', // Updated border logic
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        ...shadows.md,
                                                    }}
                                                >
                                                    <Ionicons
                                                        name={contact.icon as any}
                                                        size={28}
                                                        color={isSelected ? colors.dark : colors.textMuted}
                                                    />
                                                </Box>
                                                <Text
                                                    variant="caption"
                                                    weight={isSelected ? 'semibold' : 'medium'}
                                                    style={{
                                                        fontSize: 11,
                                                        color: isSelected ? colors.dark : colors.textMuted,
                                                    }}
                                                >
                                                    {contact.label}
                                                </Text>
                                            </VStack>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </GlassCard>
                    </VStack>
                </Animated.View >

                {/* Highlights Section */}
                <Animated.View entering={FadeInUp.delay(350).springify()}>
                    <VStack gap="md">
                        <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text variant="body" weight="semibold" style={{ color: textColor }}>
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
                            onPress={handleAddHighlight}
                            activeOpacity={0.7}
                        >
                            <GlassCard padding="lg" borderRadius="xl">
                                <VStack gap="sm" align="center" style={{ paddingVertical: spacing.lg }}>
                                    <Box
                                        width={48}
                                        height={48}
                                        style={{
                                            borderRadius: 12,
                                            backgroundColor: colors.card,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Ionicons name="add-circle-outline" size={24} color={colors.textMuted} />
                                    </Box>
                                    <Text variant="caption" color="textMuted">
                                        Tap to add your first highlight
                                    </Text>
                                </VStack>
                            </GlassCard>
                        </TouchableOpacity>
                    </VStack>
                </Animated.View >
            </ScrollView >

            {/* Floating Action Menu Bar - Glassmorphic Container */}
            < Box style={styles.floatingActions} >
                <Box style={styles.glassMenuBar}>
                    {mode === 'view' ? (
                        <HStack gap="md">
                            <Box flex={1}>
                                <TouchableOpacity
                                    style={styles.menuButton}
                                    onPress={handleToggleMode}
                                    activeOpacity={0.6}
                                >
                                    <HStack gap="xs" align="center" style={{ justifyContent: 'center' }}>
                                        <Ionicons name="create-outline" size={18} color={colors.text} />
                                        <Text variant="button" color="text">
                                            Edit Home
                                        </Text>
                                    </HStack>
                                </TouchableOpacity>
                            </Box>
                            <Box flex={1}>
                                <TouchableOpacity
                                    style={styles.menuButton}
                                    onPress={handleShare}
                                    activeOpacity={0.6}
                                >
                                    <HStack gap="xs" align="center" style={{ justifyContent: 'center' }}>
                                        <Ionicons name="share-social-outline" size={18} color={colors.text} />
                                        <Text variant="button" color="text">
                                            Share
                                        </Text>
                                    </HStack>
                                </TouchableOpacity>
                            </Box>
                        </HStack>
                    ) : (
                        <HStack gap="md">
                            <Box flex={1}>
                                <TouchableOpacity
                                    style={styles.menuButton}
                                    onPress={handleToggleMode}
                                    activeOpacity={0.6}
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
                                    activeOpacity={0.6}
                                >
                                    <HStack gap="xs" align="center" style={{ justifyContent: 'center' }}>
                                        <Ionicons name="checkmark" size={20} color={colors.white} />
                                        <Text variant="button" color="white">
                                            Save
                                        </Text>
                                    </HStack>
                                </TouchableOpacity>
                            </Box>
                        </HStack>
                    )}
                </Box>
            </Box >

            {/* Modals */}
            <ShareMenu
                visible={shareMenuVisible}
                onClose={() => setShareMenuVisible(false)}
                onShareLink={handleShareLink}
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

            <AddContactModal
                visible={addContactVisible}
                onClose={() => setAddContactVisible(false)}
                onSave={handleSaveContact}
            />
        </Box >
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
    qrCodeContainer: {
        width: 120,
        height: 120,
        borderRadius: radii.full,
        backgroundColor: colors.white,
        borderWidth: 4,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.lg,
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
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
    },
    glassMenuBar: {
        width: '60%',
        minWidth: 260,
        maxWidth: 340,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: radii['2xl'],
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
        } : {}),
        ...shadows.lg,
    },
    menuButton: {
        height: 36,
        borderRadius: radii.pill,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        height: 36,
        borderRadius: radii.pill,
        backgroundColor: colors.dark,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
