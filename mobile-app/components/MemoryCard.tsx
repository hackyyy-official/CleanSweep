/**
 * MemoryCard — Clean grid cards showing memory breakdown
 * Subtle shadows, rounded corners, minimalist typography
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, BorderRadius, Shadows, Spacing } from '../constants/theme';

interface MemoryCardProps {
    usedMB: number;
    freeMB: number;
    cachedMB: number;
    totalMB: number;
}

interface StatItemProps {
    label: string;
    value: string;
    color: string;
    unit?: string;
}

function StatItem({ label, value, color, unit = 'GB' }: StatItemProps) {
    return (
        <View style={styles.statItem}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>
                {value}
                <Text style={styles.statUnit}> {unit}</Text>
            </Text>
        </View>
    );
}

export function MemoryCard({ usedMB, freeMB, cachedMB, totalMB }: MemoryCardProps) {
    const formatGB = (mb: number) => (mb / 1024).toFixed(1);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Memory Breakdown</Text>

            <View style={styles.grid}>
                <View style={styles.card}>
                    <StatItem label="In Use" value={formatGB(usedMB)} color={Colors.primary} />
                </View>
                <View style={styles.card}>
                    <StatItem label="Free" value={formatGB(freeMB)} color={Colors.success} />
                </View>
                <View style={styles.card}>
                    <StatItem label="Cached" value={formatGB(cachedMB)} color={Colors.warning} />
                </View>
                <View style={styles.card}>
                    <StatItem label="Total" value={formatGB(totalMB)} color={Colors.textSecondary} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: Spacing.lg,
    },
    title: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: Spacing.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    card: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        ...Shadows.card,
    },
    statItem: {
        gap: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        fontWeight: FontWeight.medium,
    },
    statValue: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginTop: 2,
    },
    statUnit: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.regular,
        color: Colors.textSecondary,
    },
});
