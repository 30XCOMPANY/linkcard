/**
 * LinkCard Design System - Flex Primitive
 * 
 * Flexbox container with alignment and direction props.
 */

import React from 'react';
import { View, ViewStyle, FlexAlignType, StyleProp } from 'react-native';
import { Box, BoxProps } from './Box';

export interface FlexProps extends BoxProps {
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    align?: FlexAlignType;
    justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
    style?: StyleProp<ViewStyle>;
}

export const Flex: React.FC<FlexProps> = ({
    children,
    direction = 'row',
    align = 'stretch',
    justify = 'flex-start',
    wrap = 'nowrap',
    style,
    ...boxProps
}) => {
    const flexStyle: ViewStyle = {
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
    };

    return (
        <Box style={[flexStyle, style]} {...boxProps}>
            {children}
        </Box>
    );
};

// Shorthand components
export const Row: React.FC<Omit<FlexProps, 'direction'>> = (props) => (
    <Flex direction="row" {...props} />
);

export const Column: React.FC<Omit<FlexProps, 'direction'>> = (props) => (
    <Flex direction="column" {...props} />
);

export const Center: React.FC<FlexProps> = (props) => (
    <Flex align="center" justify="center" {...props} />
);
