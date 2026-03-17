/**
 * [INPUT]: react-native Text, ../tokens/colors, ../tokens/typography
 * [OUTPUT]: Text component, TextVariant, TextProps
 * [POS]: Primitive — unified text component with Apple HIG type scale
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from 'react';
import { Text as RNText, TextStyle, TextProps as RNTextProps } from 'react-native';
import { colors } from '../tokens/colors';
import { fontFamily, typeScale, fontSize } from '../tokens/typography';

type ColorToken = keyof typeof colors;

/* ================================================================
 * TEXT VARIANTS — Apple HIG type scale
 * ================================================================ */

const textVariants: Record<string, TextStyle> = {
    // Apple HIG Display
    largeTitle:    { fontFamily: fontFamily.bold,     ...typeScale.largeTitle },
    title1:        { fontFamily: fontFamily.bold,     ...typeScale.title1 },
    title2:        { fontFamily: fontFamily.bold,     ...typeScale.title2 },
    title3:        { fontFamily: fontFamily.semibold, ...typeScale.title3 },
    headline:      { fontFamily: fontFamily.semibold, ...typeScale.headline },
    body:          { fontFamily: fontFamily.regular,  ...typeScale.body },
    callout:       { fontFamily: fontFamily.regular,  ...typeScale.callout },
    subheadline:   { fontFamily: fontFamily.regular,  ...typeScale.subheadline },
    footnote:      { fontFamily: fontFamily.regular,  ...typeScale.footnote },
    caption1:      { fontFamily: fontFamily.regular,  ...typeScale.caption1 },
    caption2:      { fontFamily: fontFamily.regular,  ...typeScale.caption2 },

    // Legacy aliases — map to closest Apple equivalent
    displayLarge:  { fontFamily: fontFamily.bold,     fontSize: fontSize['5xl'], lineHeight: fontSize['5xl'] * 1.1, fontWeight: '700' },
    displayMedium: { fontFamily: fontFamily.bold,     fontSize: fontSize['4xl'], lineHeight: fontSize['4xl'] * 1.1, fontWeight: '700' },
    displaySmall:  { fontFamily: fontFamily.semibold, fontSize: fontSize['3xl'], lineHeight: fontSize['3xl'] * 1.15, fontWeight: '600' },
    h1:            { fontFamily: fontFamily.bold,     ...typeScale.title1 },
    h2:            { fontFamily: fontFamily.bold,     ...typeScale.title2 },
    h3:            { fontFamily: fontFamily.semibold, ...typeScale.title3 },
    h4:            { fontFamily: fontFamily.semibold, ...typeScale.headline },
    bodyLarge:     { fontFamily: fontFamily.regular,  ...typeScale.body },
    bodySmall:     { fontFamily: fontFamily.regular,  ...typeScale.footnote },
    label:         { fontFamily: fontFamily.semibold, ...typeScale.caption1 },
    button:        { fontFamily: fontFamily.semibold, ...typeScale.subheadline },
    caption:       { fontFamily: fontFamily.regular,  ...typeScale.caption1 },
    editorial:     { fontFamily: fontFamily.regular,  ...typeScale.title2, fontStyle: 'italic' },
    mono:          { fontFamily: fontFamily.monospace, ...typeScale.footnote },
};

export type TextVariant = keyof typeof textVariants;

export interface TextProps extends RNTextProps {
    variant?: TextVariant;
    color?: ColorToken;
    align?: 'left' | 'center' | 'right';
    weight?: 'regular' | 'medium' | 'semibold' | 'bold';
    children?: React.ReactNode;
}

export function Text({
    children,
    variant = 'body',
    color = 'text',
    align = 'left',
    weight,
    style,
    ...props
}: TextProps) {
    const variantStyle = textVariants[variant] ?? textVariants.body;

    const resolvedWeight = weight
        ? ({
            regular:  '400' as const,
            medium:   '500' as const,
            semibold: '600' as const,
            bold:     '700' as const,
        })[weight]
        : undefined;

    const textStyle: TextStyle = {
        ...variantStyle,
        color: colors[color],
        textAlign: align,
        ...(resolvedWeight && { fontWeight: resolvedWeight }),
    };

    return (
        <RNText style={[textStyle, style]} {...props}>
            {children}
        </RNText>
    );
}
