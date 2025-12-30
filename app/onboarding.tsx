/**
 * LinkCard Onboarding - V7 Labs Style (Strict Alignment)
 * 
 * Layout: 
 * - Form (Left, 1/3)
 * - Animation (Right, 2/3)
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Design System
import {
  colors,
  spacing,
  radii,
  gradients,
} from '@/src/design-system/tokens';
import { Text, VStack } from '@/src/design-system/primitives';
import { Button, Input } from '@/src/design-system/patterns';
import { fontFamily, fontSize, letterSpacing, lineHeight } from '@/src/design-system/tokens/typography';

import { useCardStore, createNewCard } from '@/src/stores/cardStore';
import { LinkedInProfile } from '@/src/types';
import { fetchLinkedInProfile } from '@/src/services/linkedin';
import { extractComponentsFromProfile } from '@/src/types/cardComponents';

// Load Fonts (Web only)
const FontLoader = () => {
  if (Platform.OS !== 'web') return null;

  React.useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Instrument+Serif:ital@0;1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return null;
};

// Capturing Transition View - Floating components animation
const CapturingTransitionView: React.FC<{
  profile: {
    name: string;
    headline: string;
    jobTitle?: string;
    company: string;
    location: string;
    city?: string;
    photoUrl: string | null;
    character?: string;
    publications?: Array<{
      title: string;
      publisher?: string;
      date?: string;
      description?: string;
      url?: string;
    }>;
  };
  onComplete: () => void;
}> = ({ profile, onComplete }) => {
  // Extract components from profile - filter out divider and empty components
  const allComponents = React.useMemo(() => {
    return extractComponentsFromProfile(profile);
  }, [profile]);
  
  const components = React.useMemo(() => {
    return allComponents.filter(c => {
      if (c.type === 'divider') return false;
      if (c.type === 'image' && c.content.imageUrl) return true;
      if (c.content.text && c.content.text.trim()) return true;
      if (c.content.value && c.content.value.trim()) return true;
      return false;
    });
  }, [allComponents]);
  
  // Separate first row components: photo, name, character
  const photoComponent = React.useMemo(() => {
    return components.find(c => c.id === 'photo');
  }, [components]);
  
  const nameComponent = React.useMemo(() => {
    return components.find(c => c.id === 'name');
  }, [components]);
  
  const characterComponent = React.useMemo(() => {
    return components.find(c => c.id === 'character');
  }, [components]);
  
  // Extract headline separately for full-width display
  const headlineComponent = React.useMemo(() => {
    return components.find(c => c.id === 'headline');
  }, [components]);

  // Other components for the 4-element row: Job Title, Company, Location, Email
  const otherComponents = React.useMemo(() => {
    // Priority order: jobTitle, company, location, email
    const priorityIds = ['jobTitle', 'company', 'location', 'email'];
    const filtered = components.filter(c => 
      c.id !== 'photo' && c.id !== 'name' && c.id !== 'character' && c.id !== 'headline'
    );
    // Sort by priority and limit to 4 elements
    return filtered.sort((a, b) => {
      const aIndex = priorityIds.indexOf(a.id);
      const bIndex = priorityIds.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    }).slice(0, 4); // Limit to 4 elements for clean layout
  }, [components]);
  
  // Extract specific components for elegant layout
  const jobTitleComponent = otherComponents.find(c => c.content.label === 'JOB TITLE' || c.content.label === 'Job Title');
  const companyComponent = otherComponents.find(c => c.content.label === 'COMPANY' || c.content.label === 'Company');
  const locationComponent = otherComponents.find(c => c.content.label === 'LOCATION' || c.content.label === 'Location');
  const emailComponent = otherComponents.find(c => c.content.label === 'EMAIL' || c.content.label === 'Email');

  return (
    <View style={styles.capturingContainer}>
      {/* Logo - Same position as other steps */}
      <View style={styles.capturingLogoContainer}>
        <Logo />
      </View>
      
      {/* Main Content - Single Column, Centered, Generous Spacing */}
      <ScrollView 
        contentContainerStyle={styles.capturingScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.capturingTitleSection}
        >
          <Text style={styles.capturingTitle}>Here's what we found</Text>
          <Text style={styles.capturingSubtitle}>
            Your professional information has been captured
          </Text>
        </Animated.View>

        {/* Profile Preview Card - Elegant, Minimal */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.profilePreviewCard}
        >
          {/* Profile Header: Photo + Name + Role */}
          <View style={styles.profileHeader}>
            {photoComponent && (
              <Image
                source={{ uri: photoComponent.content.imageUrl }}
                style={styles.profileAvatar}
                resizeMode="cover"
              />
            )}
            <View style={styles.profileHeaderText}>
              {nameComponent && (
                <Text style={styles.profileName}>
                  {nameComponent.content.text}
                </Text>
              )}
              {(jobTitleComponent || companyComponent) && (
                <View style={styles.profileInlineRow}>
                  {jobTitleComponent && (
                    <View style={styles.profileInlineItem}>
                      <Text style={styles.profileDetailLabel}>Job Title</Text>
                      <Text style={styles.profileRole}>
                        {jobTitleComponent.content.text}
                      </Text>
                    </View>
                  )}
                  {jobTitleComponent && companyComponent && (
                    <Text style={styles.profileSeparator}>·</Text>
                  )}
                  {companyComponent && (
                    <View style={styles.profileInlineItem}>
                      <Text style={styles.profileDetailLabel}>Company</Text>
                      <Text style={styles.profileCompany}>
                        {companyComponent.content.text}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Character Tags - If available */}
          {characterComponent && characterComponent.content.text && (
            <View style={styles.characterTags}>
              <Text style={styles.characterTagsLabel}>Character</Text>
              <View style={styles.tagsContainer}>
                {characterComponent.content.text.split(',').map((tag: string, idx: number) => {
                  const trimmedTag = tag.trim();
                  if (!trimmedTag) return null;
                  return (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{trimmedTag}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* About Me - If available */}
          {headlineComponent && headlineComponent.content.text && (
            <View style={styles.aboutSection}>
              <Text style={styles.aboutLabel}>About</Text>
              <Text style={styles.aboutText}>
                {headlineComponent.content.text}
              </Text>
            </View>
          )}

          {/* Contact Info - Subtle */}
          {emailComponent && (
            <View style={styles.contactSection}>
              <Text style={styles.contactText}>
                {emailComponent.content.value}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Button with iOS Liquid Glass Effect */}
      <Animated.View 
        entering={FadeInUp.delay(400).springify()}
        style={styles.capturingBottomBarContainer}
      >
        {Platform.OS === 'web' ? (
          <View style={styles.capturingBottomBarWeb}>
            <View style={styles.capturingBottomBarContent}>
              <Button
                onPress={onComplete}
                variant="primary"
                size="md"
                fullWidth
                style={styles.unifiedButton}
              >
                Continue to Editor
              </Button>
            </View>
          </View>
        ) : (
          <BlurView
            intensity={120}
            tint="light"
            style={styles.capturingBottomBar}
          >
            <View style={styles.capturingBottomBarContent}>
              <Button
                onPress={onComplete}
                variant="primary"
                size="md"
                fullWidth
                style={styles.unifiedButton}
              >
                Continue to Editor
              </Button>
            </View>
          </BlurView>
        )}
      </Animated.View>
    </View>
  );
};

// Simple profile element card (no floating animation)
const ProfileElementCard: React.FC<{
  component: any;
  index: number;
  isHeadlineRow?: boolean;
}> = ({ component, index, isHeadlineRow = false }) => {
  const renderContent = () => {
    if (!component || !component.content) {
      return null;
    }
    
    try {
      switch (component.type) {
        case 'heading':
          const headingText = component.content.text || '';
          if (!headingText.trim()) return null;
          return (
            <View style={styles.elementCard}>
              {component.content.label && (
                <Text style={styles.elementLabel}>{component.content.label}</Text>
              )}
              <Text style={styles.elementHeading} numberOfLines={1}>
                {headingText}
              </Text>
            </View>
          );
        case 'text':
          const textContent = component.content.text || '';
          if (!textContent.trim()) return null;
          if (isHeadlineRow) {
            return (
              <View style={styles.headlineCard}>
                {component.content.label && (
                  <Text style={styles.headlineLabel}>{component.content.label}</Text>
                )}
                <Text style={styles.headlineText}>
                  {textContent}
                </Text>
              </View>
            );
          }
          return (
            <View style={styles.elementCard}>
              {component.content.label && (
                <Text style={styles.elementLabel}>{component.content.label}</Text>
              )}
              <Text style={styles.elementText} numberOfLines={3}>
                {textContent}
              </Text>
            </View>
          );
        case 'image':
          const imageUrl = component.content.imageUrl || '';
          if (!imageUrl) return null;
          return (
            <View style={styles.profilePhoto}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.profilePhotoImage}
                resizeMode="cover"
              />
            </View>
          );
        case 'contact':
          const contactValue = component.content.value || '';
          if (!contactValue.trim()) return null;
          return (
            <View style={styles.elementCard}>
              {component.content.label && (
                <Text style={styles.elementLabel}>{component.content.label}</Text>
              )}
              <Text style={styles.elementValue} numberOfLines={1}>
                {contactValue}
              </Text>
            </View>
          );
        default:
          if (component.content.text) {
            return (
              <View style={styles.elementCard}>
                <Text style={styles.elementText}>{component.content.text}</Text>
              </View>
            );
          }
          return null;
      }
    } catch (error) {
      console.error('[ElementCard] Error rendering component:', error);
      return null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(400 + index * 60).duration(400)}
    >
      {content}
    </Animated.View>
  );
};

// Unicorn Studio Background Component (Web only)
const UnicornStudioBackground = () => {
  if (Platform.OS !== 'web') return null;

  React.useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).UnicornStudio) {
      (window as any).UnicornStudio = { isInitialized: false };
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.3/dist/unicornStudio.umd.js';
      script.onload = () => {
        if (!(window as any).UnicornStudio.isInitialized) {
          (window as any).UnicornStudio.init();
          (window as any).UnicornStudio.isInitialized = true;
        }
      };
      (document.head || document.body).appendChild(script);
    } else if ((window as any).UnicornStudio && !(window as any).UnicornStudio.isInitialized) {
      (window as any).UnicornStudio.init();
      (window as any).UnicornStudio.isInitialized = true;
    }
  }, []);

  return (
    <div
      data-us-project="9FbYZc8rJRBS6vGlo5kL"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

// Logo Component - Professional SaaS scale
const Logo = () => {
  return (
    <Image
      source={require('@/assets/Untitled design (15).svg')}
      style={{ width: 200, height: 100 }}
      resizeMode="contain"
    />
  );
};

type Step = 'auth' | 'linkedin' | 'profile' | 'complete';
type AuthMode = 'login' | 'signup';

export default function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setCard } = useCardStore();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  
  // Check for step parameter in URL
  const initialStep = (params.step as Step) || 'auth';

  const [step, setStep] = useState<Step>(initialStep);
  
  // Update step when URL params change
  React.useEffect(() => {
    if (params.step && params.step !== step) {
      setStep(params.step as Step);
    }
  }, [params.step]);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    name: string;
    headline: string;
    jobTitle?: string;
    company: string;
    location: string;
    city?: string;
    photoUrl: string | null;
    character?: string;
    publications?: Array<{
      title: string;
      publisher?: string;
      date?: string;
      description?: string;
      url?: string;
    }>;
  }>({
    name: '',
    headline: '',
    company: '',
    location: '',
    photoUrl: null,
  });

  // Handlers
  const handleAuth = () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/onboarding?step=linkedin');
    }, 800);
  };

  const handleGoogle = () => {
    // TODO: Implement Google OAuth
    // For now, just move to next step without any navigation
    router.push('/onboarding?step=linkedin');
  };

  const handleLinkedIn = async () => {
    if (!linkedinUrl.trim()) {
      setError('Please enter a LinkedIn URL or username');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch LinkedIn profile data from API
      const profileData = await fetchLinkedInProfile(linkedinUrl);
      
      // Populate form fields with fetched data
      setProfile({
        name: profileData.name || '',
        headline: profileData.headline || '',
        jobTitle: profileData.jobTitle || undefined,
        company: profileData.company || '',
        location: profileData.location || '',
        city: profileData.city || undefined,
        photoUrl: profileData.photoUrl || null,
        character: profileData.character || undefined,
        publications: (profileData as any).publications || undefined,
      });
      
      setIsLoading(false);
      setStep('profile');
    } catch (error) {
      console.error('Failed to fetch LinkedIn profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch LinkedIn profile');
      setIsLoading(false);
    }
  };

  const handleProfile = () => {
    if (!profile.name.trim()) {
      setError('Name is required');
      return;
    }
    const linkedInData: LinkedInProfile = {
      url: linkedinUrl,
      username: linkedinUrl.split('/').pop() || '',
      name: profile.name,
      headline: profile.headline,
      jobTitle: profile.jobTitle,
      company: profile.company,
      location: profile.location,
      city: profile.city,
      photoUrl: profile.photoUrl,
      character: profile.character,
      publications: profile.publications,
      lastSynced: new Date(),
      checksum: Date.now().toString(),
    };
    const newCard = createNewCard(linkedInData);
    setCard(newCard);
    router.replace('/editor');
  };

  // ========== RENDER CONTENT BY STEP ==========
  const renderStepContent = () => {
    switch (step) {
      case 'auth':
        return (
          <Animated.View entering={FadeIn.duration(400)} style={styles.formCard}>
            {/* Header */}
            <VStack gap="md" style={{ marginBottom: spacing['4xl'] }}>
              <Text style={styles.welcomeTitle}>
                The Professional{"\n"}Networking OS.
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Your identity, amplified. Create your context-aware digital business card in seconds.
              </Text>
            </VStack>

            {/* Form Actions */}
            <VStack gap="lg">
              <TouchableOpacity
                onPress={(e) => {
                  if (Platform.OS === 'web') {
                    e?.preventDefault?.();
                    e?.stopPropagation?.();
                  }
                  handleGoogle();
                }}
                style={{
                  backgroundColor: colors.white,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 160,
                  height: 52,
                  paddingHorizontal: spacing['3xl'],
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.sm,
                  width: '100%',
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={18} color={colors.text} />
                <Text style={{
                  fontFamily: fontFamily.bodyMedium,
                  fontSize: fontSize.xs,
                  letterSpacing: 0.5,
                  color: colors.text,
                }}>
                  Continue with Google
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Email/Password Form */}
              <VStack gap="lg">
                <Input
                  label="EMAIL ADDRESS"
                  placeholder="name@work-email.com"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(null); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={error || undefined}
                />
                <Input
                  label="PASSWORD"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(null); }}
                  secureTextEntry
                />
              <Button
                onPress={handleAuth}
                variant="primary"
                size="md"
                fullWidth
                loading={isLoading}
                style={styles.unifiedButton}
              >
                Continue
              </Button>
              </VStack>
            </VStack>

            {/* Footer */}
            <VStack gap="md" style={{ marginTop: spacing['3xl'] }}>
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>New to LinkCard? </Text>
                <TouchableOpacity onPress={() => { }}>
                  <Text style={styles.boldLink}>Create Account</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.termsText}>
                By continuing, you acknowledge LinkCard's{' '}
                <Text style={styles.underlineLink}>Privacy Policy</Text>.
              </Text>
            </VStack>
          </Animated.View>
        );

      case 'linkedin':
        return (
          <Animated.View entering={FadeIn.duration(400)} style={styles.formCard}>
            <VStack gap="md" style={{ marginBottom: spacing['4xl'] }}>
              <Text style={styles.welcomeTitle}>
                Add your LinkedIn.
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Link your LinkedIn, we'll do the rest.
              </Text>
            </VStack>

            <VStack gap="lg" style={{ marginBottom: spacing['8xl'] }}>
              <Input
                label="LINKEDIN URL"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChangeText={setLinkedinUrl}
                autoCapitalize="none"
                error={error || undefined}
              />
              <TouchableOpacity onPress={() => setStep('profile')} style={{ alignSelf: 'center', marginTop: spacing.md }}>
                <Text style={styles.boldLink}>Skip for now</Text>
              </TouchableOpacity>
            </VStack>
          </Animated.View>
        );

      case 'profile':
        return <CapturingTransitionView 
          profile={profile}
          onComplete={handleProfile}
        />;

      default:
        return null;
    }
  };

  // Show right side only on auth step
  const showRightSide = isDesktop && step === 'auth';
  
  // Remove maxWidth constraint for capturing step to allow full-width floating elements
  const isCapturingStep = step === 'profile';
  const isLinkedInStep = step === 'linkedin';

  // For capturing step, render it directly at root level to avoid all layout constraints
  if (isCapturingStep) {
    return (
      <View style={styles.container}>
        <FontLoader />
        {renderStepContent()}
      </View>
    );
  }

  // For LinkedIn step, add fixed bottom button
  if (isLinkedInStep) {
    return (
      <View style={styles.container}>
        <FontLoader />
        <View style={styles.centeredLayout}>
          <View style={styles.centeredSide}>
            {/* Logo - Centered at top */}
            <View style={styles.logoContainer}>
              <Logo />
            </View>

            {/* Back Button - Simple, clean */}
            <View style={styles.backButtonWrapper}>
              <TouchableOpacity onPress={() => router.push('/onboarding?step=auth')} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.contentContainer}>
              <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing['8xl'] }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.formWrapper}>
                  {renderStepContent()}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Fixed Bottom Button with Glass Effect - Outside centeredSide to span full width */}
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          style={styles.capturingBottomBarContainer}
        >
          {Platform.OS === 'web' ? (
            <View style={styles.capturingBottomBarWeb}>
              <View style={styles.capturingBottomBarContent}>
                <View style={styles.linkedInButtonContainer}>
                  <Button
                    onPress={handleLinkedIn}
                    variant="primary"
                    size="md"
                    fullWidth={true}
                    loading={isLoading}
                    style={styles.linkedInButton}
                  >
                    IMPORT PROFILE
                  </Button>
                </View>
              </View>
            </View>
          ) : (
            <BlurView
              intensity={120}
              tint="light"
              style={styles.capturingBottomBar}
            >
              <View style={styles.capturingBottomBarContent}>
                <View style={styles.linkedInButtonContainer}>
                  <Button
                    onPress={handleLinkedIn}
                    variant="primary"
                    size="md"
                    fullWidth={true}
                    loading={isLoading}
                    style={styles.linkedInButton}
                  >
                    IMPORT PROFILE
                  </Button>
                </View>
              </View>
            </BlurView>
          )}
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FontLoader />
      <View style={showRightSide ? styles.splitLayout : styles.centeredLayout}>

        {/* Left Side: Form or Centered Content */}
        <View style={showRightSide ? styles.formSide : styles.centeredSide}>
          {/* Logo - Centered at top */}
          <View style={styles.logoContainer}>
            <Logo />
          </View>

          {/* Main Content */}
          <View style={styles.contentContainer}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formWrapper}>
                {renderStepContent()}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Right Side: Visuals - Only on auth step */}
        {showRightSide && (
          <View style={styles.rightSide}>
            <UnicornStudioBackground />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  splitLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  centeredLayout: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Left Side (strict 50% for split layout)
  formSide: {
    width: '50%',
    backgroundColor: colors.white,
    flex: 1,
    position: 'relative',
  },
  // Centered Side (full width when no right side)
  centeredSide: {
    width: '100%',
    backgroundColor: colors.white,
    flex: 1,
    position: 'relative',
    maxWidth: 600,
  },
  // Capturing Side (full width for floating elements)
  capturingSide: {
    width: '100%',
    backgroundColor: colors.white,
    flex: 1,
    position: 'relative',
    // No maxWidth constraint to allow full-width floating elements
  },
  
  // Logo - Centered at top
  logoContainer: {
    width: '100%',
    paddingTop: spacing['4xl'],
    paddingHorizontal: spacing['7xl'],
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  // Content Container - Centered layout
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing['7xl'],
  },
  // Capturing Content Container - No padding for full width
  capturingContentContainer: {
    flex: 1,
    // No paddingHorizontal to allow full-width floating elements
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing['4xl'],
  },

  // Form Wrapper - Centered with max width
  formWrapper: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    marginHorizontal: 'auto',
  },

  formCard: {
    width: '100%',
  },

  // Typography - Professional SaaS Scale
  welcomeTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: fontSize['4xl'],
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 44,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Links
  backButtonWrapper: {
    width: '100%',
    paddingHorizontal: spacing['7xl'],
    marginBottom: spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  backButtonText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  boldLink: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
    textDecorationLine: 'underline',
  },
  underlineLink: {
    color: colors.text,
    textDecorationLine: 'underline',
  },

  // Divider - Clean SaaS style
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginVertical: spacing['2xl'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Footer - Professional spacing
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  termsText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Right Side
  rightSide: {
    width: '50%',
    backgroundColor: colors.card,
    position: 'relative',
    overflow: 'hidden',
  },
  taglineOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  taglineInner: {
    width: '100%',
    maxWidth: 420,
  },
  taglineTextNative: {
    fontFamily: fontFamily.serif,
    fontSize: 28,
    color: colors.dark,
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  // Capturing transition styles - Elegant SaaS Design
  capturingContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.white,
  },
  capturingLogoContainer: {
    width: '100%',
    paddingTop: spacing['4xl'],
    paddingHorizontal: spacing['7xl'],
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  capturingScrollContent: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['8xl'],
  },
  capturingTitleSection: {
    marginBottom: spacing['3xl'],
    alignItems: 'center',
  },
  capturingTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: fontSize['3xl'],
    color: colors.text,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 40,
  },
  capturingSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  profilePreviewCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: spacing['2xl'],
    gap: spacing.xl,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
  },
  profileHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontFamily: fontFamily.displayMedium,
    fontSize: fontSize.xl,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  profileDetailRow: {
    marginBottom: spacing.md,
  },
  profileInlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  profileInlineItem: {
    flex: 1,
    minWidth: 120,
  },
  profileSeparator: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    marginTop: spacing.xs + 2,
    lineHeight: 20,
  },
  profileDetailLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs / 2,
  },
  profileRole: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  profileCompany: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  profileLocation: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  characterTags: {
    marginBottom: spacing['2xl'],
    paddingTop: spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  characterTagsLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: radii.full,
  },
  tagText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  aboutSection: {
    marginBottom: spacing.xl,
    paddingTop: spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  aboutLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  aboutText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  contactSection: {
    paddingTop: spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contactText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  capturingBottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  capturingBottomBar: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  capturingBottomBarWeb: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    } as any : {}),
  },
  capturingBottomBarContent: {
    paddingHorizontal: spacing['7xl'],
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  linkedInButtonContainer: {
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  unifiedButton: {
    backgroundColor: colors.dark,
  },
  linkedInButton: {
    backgroundColor: colors.dark,
    width: '100%',
  },
  headlineRow: {
    marginTop: spacing['2xl'],
  },
  headlineCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: radii.md,
    borderWidth: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  headlineLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headlineText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  elementCardWrapper: {
    width: '100%',
  },
  elementCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  elementCardWide: {
    // Full width for headline
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignSelf: 'center',
  },
  profilePhotoImage: {
    width: '100%',
    height: '100%',
  },
  elementLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  elementHeading: {
    fontFamily: fontFamily.displayMedium,
    fontSize: fontSize.base,
    color: colors.text,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  elementText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
  },
  elementValue: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  emptyState: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
  },
  capturingButtonContainer: {
    marginTop: spacing.md,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
