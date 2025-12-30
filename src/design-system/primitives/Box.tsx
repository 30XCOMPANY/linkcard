/**
 * LinkCard Design System - Box Primitive
 * 
 * Base layout component with style props for spacing, colors, and borders.
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';
import { shadows } from '../tokens/shadows';

type ColorToken = keyof typeof colors;
type SpacingToken = keyof typeof spacing;
type RadiiToken = keyof typeof radii;
type ShadowToken = keyof typeof shadows;

export interface BoxProps {
    children?: React.ReactNode;

    // Spacing
    p?: SpacingToken;
    px?: SpacingToken;
    py?: SpacingToken;
    pt?: SpacingToken;
    pb?: SpacingToken;
    pl?: SpacingToken;
    pr?: SpacingToken;
    m?: SpacingToken;
    mx?: SpacingToken;
    my?: SpacingToken;
    mt?: SpacingToken;
    mb?: SpacingToken;
    ml?: SpacingToken;
    mr?: SpacingToken;
    gap?: SpacingToken;

    // Colors
    bg?: ColorToken;
    borderColor?: ColorToken;

    // Border
    borderWidth?: number;
    borderRadius?: RadiiToken;

    // Shadow
    shadow?: ShadowToken;

    // Layout
    flex?: number;
    width?: number | string;
    height?: number | string;

    // Custom style
    style?: ViewStyle;
}

export const Box: React.FC<BoxProps> = ({
    children,
    p, px, py, pt, pb, pl, pr,
    m, mx, my, mt, mb, ml, mr,
    gap,
    bg,
    borderColor: borderColorProp,
    borderWidth = 0,
    borderRadius,
    shadow,
    flex,
    width,
    height,
    style,
}) => {
    const boxStyle: ViewStyle = {
        // Padding
        ...(p && { padding: spacing[p] }),
        ...(px && { paddingHorizontal: spacing[px] }),
        ...(py && { paddingVertical: spacing[py] }),
        ...(pt && { paddingTop: spacing[pt] }),
        ...(pb && { paddingBottom: spacing[pb] }),
        ...(pl && { paddingLeft: spacing[pl] }),
        ...(pr && { paddingRight: spacing[pr] }),

        // Margin
        ...(m && { margin: spacing[m] }),
        ...(mx && { marginHorizontal: spacing[mx] }),
        ...(my && { marginVertical: spacing[my] }),
        ...(mt && { marginTop: spacing[mt] }),
        ...(mb && { marginBottom: spacing[mb] }),
        ...(ml && { marginLeft: spacing[ml] }),
        ...(mr && { marginRight: spacing[mr] }),

        // Gap
        ...(gap && { gap: spacing[gap] }),

        // Colors
        ...(bg && { backgroundColor: colors[bg] }),

        // Border
        borderWidth,
        ...(borderColorProp && { borderColor: colors[borderColorProp] }),
        ...(borderRadius && { borderRadius: radii[borderRadius] }),

        // Shadow
        ...(shadow && shadows[shadow]),

        // Layout
        ...(flex !== undefined && { flex }),
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
    };

    return <View style={[boxStyle, style]}>{children}</View>;
};
