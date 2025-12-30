/**
 * LinkCard Design System - Animated Text (V7 Labs Style)
 * 
 * Word carousel / typing animation component.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { Text as DSText } from './Text';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';

interface AnimatedTextProps {
    /** Static prefix text */
    prefix?: string;
    /** Array of words to cycle through */
    words: string[];
    /** Static suffix text */
    suffix?: string;
    /** Duration each word is shown (ms) */
    duration?: number;
    /** Text variant */
    variant?: 'displayLarge' | 'displayMedium' | 'displaySmall' | 'h1' | 'h2';
    /** Text color */
    color?: keyof typeof colors;
    /** Highlight color for animated word */
    highlightColor?: keyof typeof colors;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
    prefix = '',
    words,
    suffix = '',
    duration = 2500,
    variant = 'displayMedium',
    color = 'dark',
    highlightColor = 'accent1',
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out and slide up
            opacity.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
            translateY.value = withTiming(-20, { duration: 300, easing: Easing.out(Easing.ease) });

            // Change word and fade in
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % words.length);
                translateY.value = 20;
                opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
                translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
            }, 300);
        }, duration);

        return () => clearInterval(interval);
    }, [words.length, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <View style={styles.container}>
            {prefix && (
                <DSText variant={variant} color={color}>
                    {prefix}{' '}
                </DSText>
            )}
            <Animated.View style={[styles.wordContainer, animatedStyle]}>
                <DSText variant={variant} color={highlightColor} style={styles.highlightedWord}>
                    {words[currentIndex]}
                </DSText>
            </Animated.View>
            {suffix && (
                <DSText variant={variant} color={color}>
                    {' '}{suffix}
                </DSText>
            )}
        </View>
    );
};

// Typing effect component
interface TypingTextProps {
    text: string;
    speed?: number;
    variant?: 'displayLarge' | 'displayMedium' | 'displaySmall' | 'h1' | 'h2' | 'body';
    color?: keyof typeof colors;
    onComplete?: () => void;
}

export const TypingText: React.FC<TypingTextProps> = ({
    text,
    speed = 50,
    variant = 'body',
    color = 'dark',
    onComplete,
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(interval);
                setIsComplete(true);
                onComplete?.();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <View style={styles.typingContainer}>
            <DSText variant={variant} color={color}>
                {displayText}
                {!isComplete && <DSText variant={variant} color="muted">|</DSText>}
            </DSText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'baseline',
    },
    wordContainer: {
        overflow: 'hidden',
    },
    highlightedWord: {
        // Additional styling for highlighted word
    },
    typingContainer: {
        flexDirection: 'row',
    },
});
