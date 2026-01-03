/**
 * LinkCard Editor - Canvas-based Card Customization
 * Similar to Canva/Lovable interface with grid-based customization
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Design System
import {
  colors,
  spacing,
  radii,
} from '@/src/design-system/tokens';
import { Text, VStack, HStack } from '@/src/design-system/primitives';
import { Button } from '@/src/design-system/patterns';
import { fontFamily, fontSize, letterSpacing, lineHeight } from '@/src/design-system/tokens/typography';

import { useCardStore } from '@/src/stores/cardStore';
import { BusinessCard } from '@/src/components/cards/BusinessCard';
import { CardVersion, CardTemplate } from '@/src/types';
import { CardComponent, extractComponentsFromProfile } from '@/src/types/cardComponents';

export default function EditorScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { card, updateVersion, setDefaultVersion } = useCardStore();
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    card?.versions.find(v => v.isDefault)?.id || card?.versions[0]?.id || ''
  );
  const [availableComponents] = useState<CardComponent[]>(
    card ? extractComponentsFromProfile(card.profile) : []
  );
  
  // Extract additional profile data for placeholder blocks
  const additionalProfileData = useMemo(() => {
    if (!card) return null;
    const profile = card.profile as any;
    return {
      skills: profile.skills || [],
      certifications: profile.certifications || [],
      honors: profile.honors || [],
      volunteerExperience: profile.volunteerExperience || [],
      projects: profile.projects || [],
      patents: profile.patents || [],
      courses: profile.courses || [],
      organizations: profile.organizations || [],
      positions: profile.positions || [],
      education: profile.education || [],
    };
  }, [card]);

  // Redirect to onboarding if no card
  if (!card) {
    return <Redirect href="/onboarding" />;
  }

  const selectedVersion = card.versions.find(v => v.id === selectedVersionId) || card.versions[0];

  // Grid layout: Canvas (60%) + Sidebar (40%)
  const canvasWidth = width * 0.6;
  const sidebarWidth = width * 0.4;

  const handleSave = () => {
    // Save changes
    router.replace('/');
  };

  const handlePickImage = async () => {
    // TODO: Implement image picker with expo-image-picker
    // For now, show placeholder
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageUrl = event.target?.result as string;
            // TODO: Add image component to canvas
            console.log('Image selected:', imageUrl);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      // For native, would use expo-image-picker
      console.log('Image picker not yet implemented for native');
    }
  };

  const handleAddCustomText = () => {
    // TODO: Show modal to add custom text
    console.log('Add custom text');
  };

  const handleAddBlock = (blockType: string) => {
    // TODO: Implement block addition logic
    console.log('Add block:', blockType);
    // This will show a modal or form to add the specific block type
    // For now, just log the action
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            // Go back to LinkedIn import step in onboarding
            router.push('/onboarding?step=linkedin');
          }} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customize Your Card</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mainContent}>
        {/* Canvas Area (Left 60%) with Grid Background */}
        <View style={[styles.canvasArea, { width: canvasWidth }]}>
          {/* Grid Background */}
          <View style={styles.gridBackground} />
          <ScrollView
            contentContainerStyle={styles.canvasScroll}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeIn.duration(400)} style={styles.canvasContainer}>
              <View style={styles.canvas}>
                <View style={styles.cardWrapper}>
                  <BusinessCard
                    profile={card.profile}
                    version={selectedVersion}
                    qrCodeData={card.qrCodeData}
                    style={styles.cardStyle}
                  />
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </View>

        {/* Sidebar (Right 40%) - Component Supermarket */}
        <View style={[styles.sidebar, { width: sidebarWidth }]}>
          <ScrollView style={styles.sidebarScroll} showsVerticalScrollIndicator={false}>
            {/* Component Supermarket Title */}
            <VStack gap="md" style={styles.section}>
              <Text style={styles.sectionTitle}>Components</Text>
              <Text style={styles.sectionSubtitle}>
                Drag items to your card
              </Text>
            </VStack>

            {/* Profile Components from LinkedIn */}
            <VStack gap="md" style={styles.section}>
              <Text style={styles.componentGroupTitle}>From Your Profile</Text>
              <VStack gap="sm">
                {availableComponents.map((component) => (
                  <TouchableOpacity
                    key={component.id}
                    style={styles.componentCard}
                    onPress={() => {
                      // TODO: Add component to canvas
                      console.log('Add component:', component);
                    }}
                  >
                    <HStack gap="md" style={{ alignItems: 'center' }}>
                      <View style={[styles.componentIcon, { backgroundColor: colors.background }]}>
                        <Ionicons 
                          name={getComponentIcon(component.type)} 
                          size={18} 
                          color={colors.text} 
                        />
                      </View>
                      <VStack gap="xs" style={{ flex: 1 }}>
                        <Text style={styles.componentName}>
                          {getComponentName(component)}
                        </Text>
                        {component.content.text && (
                          <Text style={styles.componentPreview} numberOfLines={1}>
                            {component.content.text}
                          </Text>
                        )}
                        {component.content.value && (
                          <Text style={styles.componentPreview} numberOfLines={1}>
                            {component.content.value}
                          </Text>
                        )}
                      </VStack>
                      <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
                    </HStack>
                  </TouchableOpacity>
                ))}
              </VStack>
            </VStack>

            {/* Works / Projects */}
            <VStack gap="md" style={styles.section}>
              <Text style={styles.componentGroupTitle}>Works & Projects</Text>
              <Text style={styles.groupDescription}>
                Websites, apps, articles, publications, portfolios
              </Text>
              <View style={styles.blockGrid}>
                {/* Show placeholder if we have publications */}
                {additionalProfileData?.projects && additionalProfileData.projects.length > 0 && (
                  <TouchableOpacity
                    style={[styles.blockButton, styles.blockButtonWithData]}
                    onPress={() => handleAddBlock('project')}
                  >
                    <Ionicons name="folder-outline" size={24} color={colors.text} />
                    <Text style={styles.blockLabel}>Projects</Text>
                    <Text style={styles.blockCount}>{additionalProfileData.projects.length}</Text>
                  </TouchableOpacity>
                )}
                
                {/* Show placeholder for publications if we have them */}
                {card?.profile.publications && card.profile.publications.length > 0 && (
                  <TouchableOpacity
                    style={[styles.blockButton, styles.blockButtonWithData]}
                    onPress={() => handleAddBlock('publication')}
                  >
                    <Ionicons name="document-text-outline" size={24} color={colors.text} />
                    <Text style={styles.blockLabel}>Publications</Text>
                    <Text style={styles.blockCount}>{card.profile.publications.length}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={() => handleAddBlock('link')}
                >
                  <Ionicons name="link-outline" size={24} color={colors.text} />
                  <Text style={styles.blockLabel}>Import Link</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={() => handleAddBlock('title')}
                >
                  <Ionicons name="text-outline" size={24} color={colors.text} />
                  <Text style={styles.blockLabel}>Title</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={handleAddCustomText}
                >
                  <Ionicons name="document-text-outline" size={24} color={colors.text} />
                  <Text style={styles.blockLabel}>Text</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={handlePickImage}
                >
                  <Ionicons name="image-outline" size={24} color={colors.text} />
                  <Text style={styles.blockLabel}>Image</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={() => handleAddBlock('app')}
                >
                  <Ionicons name="phone-portrait-outline" size={24} color={colors.text} />
                  <Text style={styles.blockLabel}>App</Text>
                </TouchableOpacity>
              </View>
            </VStack>

            {/* Experience */}
            <VStack gap="md" style={styles.section}>
              <Text style={styles.componentGroupTitle}>Experience</Text>
              <View style={styles.blockGrid}>
                {/* Show placeholders if we have data from LinkedIn */}
                {additionalProfileData?.honors && additionalProfileData.honors.length > 0 && (
                  <TouchableOpacity
                    style={[styles.blockButton, styles.blockButtonWithData]}
                    onPress={() => handleAddBlock('award')}
                  >
                    <Ionicons name="trophy-outline" size={24} color={colors.text} />
                    <Text style={styles.blockLabel}>Awards</Text>
                    <Text style={styles.blockCount}>{additionalProfileData.honors.length}</Text>
                  </TouchableOpacity>
                )}

                {additionalProfileData?.education && additionalProfileData.education.length > 0 && (
                  <TouchableOpacity
                    style={[styles.blockButton, styles.blockButtonWithData]}
                    onPress={() => handleAddBlock('education')}
                  >
                    <Ionicons name="school-outline" size={24} color={colors.text} />
                    <Text style={styles.blockLabel}>Education</Text>
                    <Text style={styles.blockCount}>{additionalProfileData.education.length}</Text>
                  </TouchableOpacity>
                )}

                {additionalProfileData?.positions && additionalProfileData.positions.length > 0 && (
                  <TouchableOpacity
                    style={[styles.blockButton, styles.blockButtonWithData]}
                    onPress={() => handleAddBlock('work')}
                  >
                    <Ionicons name="briefcase-outline" size={24} color={colors.text} />
                    <Text style={styles.blockLabel}>Work</Text>
                    <Text style={styles.blockCount}>{additionalProfileData.positions.length}</Text>
                  </TouchableOpacity>
                )}

                {additionalProfileData?.volunteerExperience && additionalProfileData.volunteerExperience.length > 0 && (
                  <TouchableOpacity
                    style={[styles.blockButton, styles.blockButtonWithData]}
                    onPress={() => handleAddBlock('volunteer')}
                  >
                    <Ionicons name="heart-outline" size={24} color={colors.text} />
                    <Text style={styles.blockLabel}>Volunteer</Text>
                    <Text style={styles.blockCount}>{additionalProfileData.volunteerExperience.length}</Text>
                  </TouchableOpacity>
                )}

                {/* Always show these for manual addition */}
                {(!additionalProfileData?.honors || additionalProfileData.honors.length === 0) && (
                  <TouchableOpacity
                    style={styles.blockButton}
                    onPress={() => handleAddBlock('award')}
                  >
                    <Ionicons name="trophy-outline" size={24} color={colors.text} />
                    <Text style={styles.blockLabel}>Awards</Text>
                  </TouchableOpacity>
                )}

                {(!additionalProfileData?.education || additionalProfileData.education.length === 0) && (
                  <TouchableOpacity
                    style={styles.blockButton}
                    onPress={() => handleAddBlock('education')}
                  >
                    <Ionicons name="school-outline" size={24} color={colors.text} />
                    <Text style={styles.blockLabel}>Education</Text>
                  </TouchableOpacity>
                )}

                {(!additionalProfileData?.positions || additionalProfileData.positions.length === 0) && (
                  <TouchableOpacity
                    style={styles.blockButton}
                    onPress={() => handleAddBlock('work')}
                  >
                    <Ionicons name="briefcase-outline" size={24} color={colors.text} />
                    <Text style={styles.blockLabel}>Work</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={() => handleAddBlock('highlight')}
                >
                  <Ionicons name="star-outline" size={24} color={colors.text} />
                  <Text style={styles.blockLabel}>Highlights</Text>
                </TouchableOpacity>
              </View>
            </VStack>

            {/* Social Media */}
            <VStack gap="md" style={styles.section}>
              <Text style={styles.componentGroupTitle}>Social Media</Text>
              <View style={styles.blockGrid}>
                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={() => handleAddBlock('github')}
                >
                  <Ionicons name="logo-github" size={24} color={colors.text} />
                  <Text style={styles.blockLabel}>GitHub</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={() => handleAddBlock('twitter')}
                >
                  <Ionicons name="logo-twitter" size={24} color={colors.text} />
                  <Text style={styles.blockLabel}>X / Twitter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={() => handleAddBlock('instagram')}
                >
                  <Ionicons name="logo-instagram" size={24} color={colors.text} />
                  <Text style={styles.blockLabel}>Instagram</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={() => handleAddBlock('linkedin')}
                >
                  <Ionicons name="logo-linkedin" size={24} color={colors.text} />
                  <Text style={styles.blockLabel}>LinkedIn</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={() => handleAddBlock('social-more')}
                >
                  <Ionicons name="ellipsis-horizontal-outline" size={24} color={colors.text} />
                  <Text style={styles.blockLabel}>More</Text>
                </TouchableOpacity>
              </View>
            </VStack>

            {/* Additional Blocks */}
            {(additionalProfileData?.skills?.length > 0 || 
              additionalProfileData?.certifications?.length > 0 || 
              additionalProfileData?.courses?.length > 0 ||
              additionalProfileData?.organizations?.length > 0 ||
              additionalProfileData?.patents?.length > 0) && (
              <VStack gap="md" style={styles.section}>
                <Text style={styles.componentGroupTitle}>Additional</Text>
                <View style={styles.blockGrid}>
                  {additionalProfileData.skills && additionalProfileData.skills.length > 0 && (
                    <TouchableOpacity
                      style={[styles.blockButton, styles.blockButtonWithData]}
                      onPress={() => handleAddBlock('skills')}
                    >
                      <Ionicons name="checkmark-circle-outline" size={24} color={colors.text} />
                      <Text style={styles.blockLabel}>Skills</Text>
                      <Text style={styles.blockCount}>{additionalProfileData.skills.length}</Text>
                    </TouchableOpacity>
                  )}

                  {additionalProfileData.certifications && additionalProfileData.certifications.length > 0 && (
                    <TouchableOpacity
                      style={[styles.blockButton, styles.blockButtonWithData]}
                      onPress={() => handleAddBlock('certification')}
                    >
                      <Ionicons name="ribbon-outline" size={24} color={colors.text} />
                      <Text style={styles.blockLabel}>Certifications</Text>
                      <Text style={styles.blockCount}>{additionalProfileData.certifications.length}</Text>
                    </TouchableOpacity>
                  )}

                  {additionalProfileData.courses && additionalProfileData.courses.length > 0 && (
                    <TouchableOpacity
                      style={[styles.blockButton, styles.blockButtonWithData]}
                      onPress={() => handleAddBlock('course')}
                    >
                      <Ionicons name="library-outline" size={24} color={colors.text} />
                      <Text style={styles.blockLabel}>Courses</Text>
                      <Text style={styles.blockCount}>{additionalProfileData.courses.length}</Text>
                    </TouchableOpacity>
                  )}

                  {additionalProfileData.organizations && additionalProfileData.organizations.length > 0 && (
                    <TouchableOpacity
                      style={[styles.blockButton, styles.blockButtonWithData]}
                      onPress={() => handleAddBlock('organization')}
                    >
                      <Ionicons name="people-outline" size={24} color={colors.text} />
                      <Text style={styles.blockLabel}>Organizations</Text>
                      <Text style={styles.blockCount}>{additionalProfileData.organizations.length}</Text>
                    </TouchableOpacity>
                  )}

                  {additionalProfileData.patents && additionalProfileData.patents.length > 0 && (
                    <TouchableOpacity
                      style={[styles.blockButton, styles.blockButtonWithData]}
                      onPress={() => handleAddBlock('patent')}
                    >
                      <Ionicons name="document-outline" size={24} color={colors.text} />
                      <Text style={styles.blockLabel}>Patents</Text>
                      <Text style={styles.blockCount}>{additionalProfileData.patents.length}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </VStack>
            )}

            {/* Utilities */}
            <VStack gap="md" style={styles.section}>
              <Text style={styles.componentGroupTitle}>Utilities</Text>
              <View style={styles.blockGrid}>
                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={() => handleAddBlock('divider')}
                >
                  <Ionicons name="remove-outline" size={24} color={colors.text} />
                  <Text style={styles.blockLabel}>Divider</Text>
                </TouchableOpacity>
              </View>
            </VStack>

            {/* Version Selection (Collapsed) */}
            <VStack gap="md" style={styles.section}>
              <Text style={styles.sectionTitle}>Card Version</Text>
              <VStack gap="sm">
                {card.versions.map((version) => (
                  <TouchableOpacity
                    key={version.id}
                    onPress={() => {
                      setSelectedVersionId(version.id);
                      setDefaultVersion(version.id);
                    }}
                    style={[
                      styles.versionCard,
                      selectedVersionId === version.id && styles.versionCardSelected,
                    ]}
                  >
                    <HStack gap="md" style={{ alignItems: 'center', flex: 1 }}>
                      <View
                        style={[
                          styles.versionIndicator,
                          { backgroundColor: version.accentColor },
                        ]}
                      />
                      <VStack gap="xs" style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.versionName,
                            selectedVersionId === version.id && styles.versionNameSelected,
                          ]}
                        >
                          {version.name}
                        </Text>
                        {version.description && (
                          <Text style={styles.versionDescription}>{version.description}</Text>
                        )}
                      </VStack>
                      {selectedVersionId === version.id && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.dark} />
                      )}
                    </HStack>
                  </TouchableOpacity>
                ))}
              </VStack>
            </VStack>

            {/* Template Selection */}
            <VStack gap="md" style={styles.section}>
              <Text style={styles.sectionTitle}>Template</Text>
              <View style={styles.grid}>
                {(['classic', 'modern', 'minimal', 'bento'] as CardTemplate[]).map((template) => (
                  <TouchableOpacity
                    key={template}
                    onPress={() => {
                      updateVersion(selectedVersionId, { template });
                    }}
                    style={[
                      styles.templateCard,
                      selectedVersion.template === template && styles.templateCardSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.templateName,
                        selectedVersion.template === template && styles.templateNameSelected,
                      ]}
                    >
                      {template.charAt(0).toUpperCase() + template.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </VStack>

            {/* Color Customization */}
            <VStack gap="md" style={styles.section}>
              <Text style={styles.sectionTitle}>Accent Color</Text>
              <View style={styles.colorGrid}>
                {[
                  '#6366F1', // indigo
                  '#8B5CF6', // violet
                  '#10B981', // emerald
                  '#F59E0B', // amber
                  '#EF4444', // red
                  '#3B82F6', // blue
                ].map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => {
                      updateVersion(selectedVersionId, { accentColor: color });
                    }}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      selectedVersion.accentColor === color && styles.colorSwatchSelected,
                    ]}
                  >
                    {selectedVersion.accentColor === color && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </VStack>

            {/* Settings */}
            <VStack gap="md" style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <VStack gap="sm">
                {[
                  { key: 'photoUrl', label: 'Profile Photo' },
                  { key: 'name', label: 'Full Name' },
                  { key: 'headline', label: 'Headline' },
                  { key: 'company', label: 'Company' },
                  { key: 'location', label: 'Location' },
                  { key: 'email', label: 'Email' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'website', label: 'Website' },
                  { key: 'qrCode', label: 'QR Code' },
                ].map((field) => {
                  const isVisible = selectedVersion.visibleFields.includes(
                    field.key as keyof typeof card.profile
                  );
                  return (
                    <TouchableOpacity
                      key={field.key}
                      onPress={() => {
                        const currentFields = selectedVersion.visibleFields;
                        const newFields = isVisible
                          ? currentFields.filter((f) => f !== field.key)
                          : [...currentFields, field.key as any];
                        updateVersion(selectedVersionId, { visibleFields: newFields });
                      }}
                      style={styles.fieldRow}
                    >
                      <HStack gap="md" style={{ alignItems: 'center', flex: 1 }}>
                        <View
                          style={[
                            styles.checkbox,
                            isVisible && { backgroundColor: colors.dark },
                          ]}
                        >
                          {isVisible && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                        </View>
                        <Text style={styles.fieldLabel}>{field.label}</Text>
                      </HStack>
                    </TouchableOpacity>
                  );
                })}
              </VStack>
            </VStack>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <Button
              onPress={handleSave}
              variant="primary"
              size="lg"
              fullWidth
              style={{ backgroundColor: colors.dark }}
            >
              Save Changes
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingTop: Platform.OS === 'web' ? spacing.xl : spacing['2xl'],
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    letterSpacing: letterSpacing.tight,
    color: colors.text,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  canvasArea: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.background,
    position: 'relative',
  },
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' 
      ? {
          backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          opacity: 0.4,
        } as any
      : {
          // For native, create a grid pattern using View components or SVG
          // For now, just show a subtle background
          opacity: 0.3,
        }),
  },
  canvasScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['4xl'],
  },
  canvasContainer: {
    width: '100%',
    alignItems: 'center',
  },
  canvas: {
    width: 375, // Apple Wallet standard width
    aspectRatio: 375 / 232, // Apple Wallet standard ratio (~1.62:1)
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: radii.xl, // Apple Wallet uses rounded corners (14px typical)
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 0, // Remove border radius from card itself since wrapper has it
  },
  sidebar: {
    backgroundColor: colors.white,
  },
  sidebarScroll: {
    flex: 1,
  },
  section: {
    padding: spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wide,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  versionCard: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  versionCardSelected: {
    borderColor: colors.dark,
    borderWidth: 2,
    backgroundColor: colors.background,
  },
  versionIndicator: {
    width: 4,
    height: 40,
    borderRadius: radii.sm,
  },
  versionName: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
    color: colors.text,
  },
  versionNameSelected: {
    fontFamily: fontFamily.bodyBold,
    color: colors.dark,
  },
  versionDescription: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  templateCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateCardSelected: {
    borderColor: colors.dark,
    borderWidth: 2,
    backgroundColor: colors.background,
  },
  templateName: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  templateNameSelected: {
    fontFamily: fontFamily.bodyBold,
    color: colors.dark,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: colors.dark,
    borderWidth: 3,
  },
  fieldRow: {
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text,
  },
  footer: {
    padding: spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  sectionSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },
  componentGroupTitle: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  componentCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  customComponentCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.background,
  },
  componentIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  componentName: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  componentPreview: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  groupDescription: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: -spacing.xs,
    lineHeight: lineHeight.relaxed,
  },
  blockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  blockButton: {
    width: '30%',
    minWidth: 80,
    aspectRatio: 1,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  blockLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.text,
    textAlign: 'center',
  },
});

// Helper functions
function getComponentIcon(type: string): any {
  const iconMap: Record<string, any> = {
    heading: 'text',
    text: 'document-text-outline',
    image: 'image-outline',
    contact: 'person-outline',
    social: 'share-social-outline',
    qr: 'qr-code-outline',
    divider: 'remove-outline',
    custom: 'add-outline',
  };
  return iconMap[type] || 'square-outline';
}

function getComponentName(component: CardComponent): string {
  if (component.content.label) {
    return component.content.label;
  }
  if (component.content.text) {
    return component.content.text.length > 20 
      ? component.content.text.substring(0, 20) + '...'
      : component.content.text;
  }
  const typeMap: Record<string, string> = {
    heading: 'Heading',
    text: 'Text',
    image: 'Image',
    contact: 'Contact',
    social: 'Social',
    qr: 'QR Code',
    divider: 'Divider',
    custom: 'Custom',
  };
  return typeMap[component.type] || 'Component';
}

