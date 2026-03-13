/**
 * RamGauge — Circular progress ring showing RAM usage
 * Minimalist design with thin stroke and elegant typography
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Colors, FontSize, FontWeight } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RamGaugeProps {
    percentage: number;
    usedMB: number;
    totalMB: number;
    size?: number;
    strokeWidth?: number;
}

export function RamGauge({
    percentage,
    usedMB,
    totalMB,
    size = 220,
    strokeWidth = 10,
}: RamGaugeProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(percentage / 100, {
            duration: 1200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
    }, [percentage, progress]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    // Color based on usage level
    const getColor = () => {
        if (percentage >= 85) return Colors.danger;
        if (percentage >= 65) return Colors.warning;
        return Colors.primary;
    };

    const formatGB = (mb: number) => (mb / 1024).toFixed(1);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} style={styles.svg}>
                {/* Track */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={Colors.gaugeTrack}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    transform={`rotate(-90, ${size / 2}, ${size / 2})`}
                />
            </Svg>

            {/* Center text */}
            <View style={styles.centerText}>
                <Text style={[styles.percentage, { color: getColor() }]}>
                    {percentage}
                    <Text style={styles.percentSign}>%</Text>
                </Text>
                <Text style={styles.label}>Used</Text>
                <Text style={styles.detail}>
                    {formatGB(usedMB)} / {formatGB(totalMB)} GB
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    svg: {
        position: 'absolute',
    },
    centerText: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    percentage: {
        fontSize: FontSize.display,
        fontWeight: FontWeight.bold,
        lineHeight: FontSize.display + 4,
    },
    percentSign: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.medium,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 2,
    },
    detail: {
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        marginTop: 4,
    },
});
