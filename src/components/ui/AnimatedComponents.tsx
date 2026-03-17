import React, { useEffect } from 'react';
import { ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Easing,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideInLeft,
  SlideInUp,
  SlideInDown,
  ZoomIn,
  ZoomOut,
  BounceIn,
  BounceOut,
  FlipInXUp,
  FlipOutXUp,
} from 'react-native-reanimated';
import { animation } from '@/src/design-system/tokens';

// Export entering animations for easy access
export const EnteringAnimations = {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideInLeft,
  SlideInUp,
  SlideInDown,
  ZoomIn,
  ZoomOut,
  BounceIn,
  BounceOut,
  FlipInXUp,
  FlipOutXUp,
};

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

/**
 * Animated container that staggers children entry
 */
export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 100,
  direction = 'up',
}) => {
  const getAnimation = (index: number) => {
    const delay = index * staggerDelay;
    switch (direction) {
      case 'up':
        return FadeIn.delay(delay).springify();
      case 'down':
        return SlideInDown.delay(delay).springify();
      case 'left':
        return SlideInLeft.delay(delay).springify();
      case 'right':
        return SlideInRight.delay(delay).springify();
      default:
        return FadeIn.delay(delay).springify();
    }
  };

  return (
    <>
      {React.Children.map(children, (child, index) => (
        <Animated.View entering={getAnimation(index)}>
          {child}
        </Animated.View>
      ))}
    </>
  );
};

interface PulsatingViewProps {
  children: React.ReactNode;
  intensity?: number;
  duration?: number;
  style?: ViewStyle;
}

/**
 * View that gently pulsates (good for highlighting)
 */
export const PulsatingView: React.FC<PulsatingViewProps> = ({
  children,
  intensity = 0.05,
  duration = 1500,
  style,
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1 + intensity, { duration: duration / 2 }),
        withTiming(1, { duration: duration / 2 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

interface ShimmerViewProps {
  children: React.ReactNode;
  width: number;
  style?: ViewStyle;
}

/**
 * Shimmer loading effect
 */
export const ShimmerView: React.FC<ShimmerViewProps> = ({
  children,
  width,
  style,
}) => {
  const translateX = useSharedValue(-width);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(width * 2, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.shimmerContainer, style]}>
      {children}
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </Animated.View>
  );
};

interface FloatingViewProps {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
  style?: ViewStyle;
}

/**
 * Floating animation (subtle up/down movement)
 */
export const FloatingView: React.FC<FloatingViewProps> = ({
  children,
  amplitude = 10,
  duration = 3000,
  style,
}) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-amplitude, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

interface RotatingViewProps {
  children: React.ReactNode;
  duration?: number;
  style?: ViewStyle;
}

/**
 * Continuously rotating view
 */
export const RotatingView: React.FC<RotatingViewProps> = ({
  children,
  duration = 2000,
  style,
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

interface ScaleOnPressProps {
  children: React.ReactNode;
  scale?: number;
  style?: ViewStyle;
}

/**
 * Hook for scale on press animation
 */
export const useScaleAnimation = (targetScale: number = 0.95) => {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withSpring(targetScale, animation.springs.snappy);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, animation.springs.snappy);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, onPressIn, onPressOut };
};

/**
 * Hook for slide in animation
 */
export const useSlideInAnimation = (
  direction: 'left' | 'right' | 'up' | 'down' = 'up',
  distance: number = 50,
  delay: number = 0
) => {
  const translateX = useSharedValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
  const translateY = useSharedValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(delay, withSpring(0, animation.springs.snappy));
    translateY.value = withDelay(delay, withSpring(0, animation.springs.snappy));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return animatedStyle;
};

/**
 * Hook for flip card animation
 */
export const useFlipAnimation = () => {
  const rotateY = useSharedValue(0);
  const isFlipped = useSharedValue(false);

  const flip = () => {
    rotateY.value = withSpring(isFlipped.value ? 0 : 180, animation.springs.snappy);
    isFlipped.value = !isFlipped.value;
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotateY.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotateY.value + 180}deg` }],
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }));

  return { flip, frontStyle, backStyle, isFlipped };
};

const styles = StyleSheet.create({
  shimmerContainer: {
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
});


