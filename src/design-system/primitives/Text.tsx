/**
 * LinkCard Design System - Text Primitive (V7 Labs Style)
 * 
 * Features:
 * - NEGATIVE letter-spacing on headlines (-0.03em)
 * - Tight line heights (1:1 for display)
 * - Bold geometric sans for headlines
 */

import React from 'react';
import { Text as RNText, TextStyle, TextProps as RNTextProps, Platform } from 'react-native';
import { colors } from '../tokens/colors';
import { fontFamily, fontSize, lineHeight, letterSpacing } from '../tokens/typography';

type ColorToken = keyof typeof colors;

// V7 Labs style text variants
const textVariants = {
    // Display - Large hero headlines with NEGATIVE letter-spacing
    displayLarge: {
        fontFamily: fontFamily.display,
        fontSize: fontSize['5xl'],        // 48px
        lineHeight: fontSize['5xl'],      // 1:1 ratio (V7 style)
        letterSpacing: -1.44,             // -1.44px (V7 exact value)
    },
    displayMedium: {
        fontFamily: fontFamily.display,
        fontSize: fontSize['4xl'],        // 36px
        lineHeight: fontSize['4xl'] * 1.05,
        letterSpacing: -1.08,             // V7 exact
    },
    displaySmall: {
        fontFamily: fontFamily.displayMedium,
        fontSize: fontSize['3xl'],
        lineHeight: fontSize['3xl'] * 1.1,
        letterSpacing: -0.66,
    },

    // Editorial serif (Martina Plantijn style)
    editorial: {
        fontFamily: fontFamily.serifItalic,
        fontSize: fontSize['3xl'],
        lineHeight: fontSize['3xl'] * 1.2,
        letterSpacing: 0,
    },

    // Headings - DM Sans Bold
    h1: {
        fontFamily: fontFamily.display,
        fontSize: fontSize['4xl'],
        lineHeight: fontSize['4xl'] * 1.1,
        letterSpacing: -0.8,
    },
    h2: {
        fontFamily: fontFamily.display,
        fontSize: fontSize['3xl'],
        lineHeight: fontSize['3xl'] * 1.15,
        letterSpacing: -0.5,
    },
    h3: {
        fontFamily: fontFamily.displayMedium,
        fontSize: fontSize['2xl'],         // 24px
        lineHeight: 26,                    // V7 exact
        letterSpacing: -0.66,              // V7 exact
    },
    h4: {
        fontFamily: fontFamily.bodySemibold,
        fontSize: fontSize.xl,
        lineHeight: fontSize.xl * 1.3,
        letterSpacing: -0.3,
    },

    // Body - V7 uses 16px/24px with slight negative tracking
    bodyLarge: {
        fontFamily: fontFamily.body,
        fontSize: fontSize.base,           // 16px
        lineHeight: 24,                    // V7 exact
        letterSpacing: -0.14,              // V7 exact
    },
    body: {
        fontFamily: fontFamily.body,
        fontSize: fontSize.sm,             // 14px
        lineHeight: 20,                    // V7 exact
        letterSpacing: -0.14,              // V7 exact
    },
    bodySmall: {
        fontFamily: fontFamily.body,
        fontSize: fontSize.xs,
        lineHeight: fontSize.xs * 1.5,
        letterSpacing: 0,
    },

    // UI Elements
    label: {
        fontFamily: fontFamily.bodySemibold,
        fontSize: fontSize.xs,             // 12px
        lineHeight: fontSize.xs * 1.4,
        letterSpacing: 0,
    },
    button: {
        fontFamily: fontFamily.bodySemibold,
        fontSize: fontSize.xs,             // 12px (V7 buttons)
        lineHeight: fontSize.xs,
        letterSpacing: 0,
    },
    caption: {
        fontFamily: fontFamily.body,
        fontSize: fontSize.xs,
        lineHeight: fontSize.xs * 1.4,
        letterSpacing: 0,
    },

    // Mono
    mono: {
        fontFamily: fontFamily.mono,
        fontSize: fontSize.sm,
        lineHeight: fontSize.sm * 1.5,
        letterSpacing: 0,
    },
} as const;

export type TextVariant = keyof typeof textVariants;

export interface TextProps extends RNTextProps {
    variant?: TextVariant;
    color?: ColorToken;
    align?: 'left' | 'center' | 'right';
    weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

export const Text: React.FC<TextProps> = ({
    children,
    variant = 'body',
    color = 'text',
    align = 'left',
    weight,
    style,
    ...props
}) => {
    const variantStyle = textVariants[variant];

    const textStyle: TextStyle = {
        ...variantStyle,
        color: colors[color],
        textAlign: align,
        ...(weight === 'medium' && { fontFamily: fontFamily.bodyMedium }),
        ...(weight === 'semibold' && { fontFamily: fontFamily.bodySemibold }),
        ...(weight === 'bold' && { fontFamily: fontFamily.bodyBold }),
    };

    return (
        <RNText style={[textStyle, style]} {...props}>
            {children}
        </RNText>
    );
};
