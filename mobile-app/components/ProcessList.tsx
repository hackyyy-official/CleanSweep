/**
 * ProcessList — Scrollable list of running processes
 * Shows package name and memory usage
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing, Shadows } from '../constants/theme';
import { ProcessInfo } from '../services/processes';

interface ProcessListProps {
    processes: ProcessInfo[];
    onStopProcess?: (packageName: string) => void;
    maxItems?: number;
}

function formatMemory(kb: number): string {
    if (kb >= 1024 * 1024) {
        return `${(kb / (1024 * 1024)).toFixed(1)} GB`;
    }
    if (kb >= 1024) {
        return `${(kb / 1024).toFixed(0)} MB`;
    }
    return `${kb} KB`;
}

function ProcessItem({
    item,
    onStop,
}: {
    item: ProcessInfo;
    onStop?: (pkg: string) => void;
}) {
    const handleLongPress = async () => {
        if (!onStop) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        Alert.alert(
            'Force Stop',
            `Stop ${item.displayName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Stop',
                    style: 'destructive',
                    onPress: () => onStop(item.packageName),
                },
            ]
        );
    };

    // Memory bar width (max 100%)
    const memPercent = Math.min(100, (item.memoryKB / (512 * 1024)) * 100);

    return (
        <TouchableOpacity
            style={styles.processItem}
            onLongPress={handleLongPress}
            activeOpacity={0.7}
        >
            <View style={styles.processInfo}>
                <View style={styles.processIcon}>
                    <Text style={styles.processIconText}>
                        {item.displayName.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.processDetails}>
                    <Text style={styles.processName} numberOfLines={1}>
                        {item.displayName}
                    </Text>
                    <Text style={styles.processPackage} numberOfLines={1}>
                        {item.packageName}
                    </Text>
                </View>
                <Text style={styles.processMem}>{formatMemory(item.memoryKB)}</Text>
            </View>
            <View style={styles.memBarTrack}>
                <View
                    style={[
                        styles.memBarFill,
                        {
                            width: `${memPercent}%`,
                            backgroundColor:
                                memPercent > 60 ? Colors.danger :
                                    memPercent > 35 ? Colors.warning :
                                        Colors.primary,
                        },
                    ]}
                />
            </View>
        </TouchableOpacity>
    );
}

export function ProcessList({
    processes,
    onStopProcess,
    maxItems = 10,
}: ProcessListProps) {
    const displayProcesses = processes.slice(0, maxItems);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Running Apps</Text>
                <Text style={styles.count}>{processes.length} apps</Text>
            </View>

            <FlatList
                data={displayProcesses}
                keyExtractor={(item) => `${item.pid}-${item.packageName}`}
                renderItem={({ item }) => (
                    <ProcessItem item={item} onStop={onStopProcess} />
                )}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.list}
            />

            {processes.length > maxItems && (
                <Text style={styles.moreText}>
                    +{processes.length - maxItems} more apps
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    count: {
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        fontWeight: FontWeight.medium,
    },
    list: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.lg,
        ...Shadows.card,
        overflow: 'hidden',
    },
    processItem: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
    },
    processInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    processIcon: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    processIconText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
    },
    processDetails: {
        flex: 1,
    },
    processName: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: Colors.textPrimary,
    },
    processPackage: {
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        marginTop: 1,
    },
    processMem: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: Colors.textSecondary,
        minWidth: 55,
        textAlign: 'right',
    },
    memBarTrack: {
        height: 3,
        backgroundColor: Colors.gaugeTrack,
        borderRadius: 2,
        marginTop: Spacing.xs + 2,
        overflow: 'hidden',
    },
    memBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.borderLight,
        marginHorizontal: Spacing.md,
    },
    moreText: {
        textAlign: 'center',
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        marginTop: Spacing.sm,
    },
});
