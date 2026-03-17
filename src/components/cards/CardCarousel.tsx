import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ViewToken,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { BusinessCard } from './BusinessCard';
import { LinkedInProfile, CardVersion } from '@/src/types';
import { spacing, typography, radii } from '@/src/design-system/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CardCarouselProps {
  profile: LinkedInProfile;
  versions: CardVersion[];
  qrCodeData: string;
  onVersionChange?: (version: CardVersion) => void;
}

export const CardCarousel: React.FC<CardCarouselProps> = ({
  profile,
  versions,
  qrCodeData,
  onVersionChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
        onVersionChange?.(versions[viewableItems[0].index]);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderCard = ({ item, index }: { item: CardVersion; index: number }) => (
    <View style={styles.cardWrapper}>
      <BusinessCard
        profile={profile}
        version={item}
        qrCodeData={qrCodeData}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={versions}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
      />

      {/* Version name */}
      <Text style={styles.versionName}>
        {versions[activeIndex]?.name}
      </Text>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {versions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex && styles.activeDot,
              index === activeIndex && {
                backgroundColor: versions[activeIndex]?.accentColor,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  cardWrapper: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing['2xl'],
    justifyContent: 'center',
  },
  versionName: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: '#171717',
    marginTop: spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5E5',
  },
  activeDot: {
    width: 24,
  },
});


