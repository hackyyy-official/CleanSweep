/**
 * Dashboard Screen — CleanSweep Mobile
 * Minimalist white UI with RAM gauge, memory breakdown, and optimize button
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../constants/theme';
import { RamGauge } from '../components/RamGauge';
import { CleanButton } from '../components/CleanButton';
import { MemoryCard } from '../components/MemoryCard';
import { ProcessList } from '../components/ProcessList';
import { useMemoryInfo } from '../hooks/useMemoryInfo';
import { getRunningProcesses, stopProcess, ProcessInfo } from '../services/processes';

export default function DashboardScreen() {
    const router = useRouter();
    const { memory, isLoading, isCleaning, lastCleanResult, refresh, clean } = useMemoryInfo();
    const [processes, setProcesses] = useState<ProcessInfo[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Load processes
    useEffect(() => {
        getRunningProcesses().then(setProcesses);
    }, [memory]); // refresh when memory changes

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refresh();
        const procs = await getRunningProcesses();
        setProcesses(procs);
        setRefreshing(false);
    }, [refresh]);

    const handleClean = useCallback(async () => {
        const result = await clean();
        if (result.success) {
            const procs = await getRunningProcesses();
            setProcesses(procs);
        }
    }, [clean]);

    const handleStopProcess = useCallback(async (packageName: string) => {
        const success = await stopProcess(packageName);
        if (success) {
            setProcesses((prev) => prev.filter((p) => p.packageName !== packageName));
            await refresh();
        } else {
            Alert.alert('Error', `Failed to stop ${packageName}`);
        }
    }, [refresh]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.primary}
                        colors={[Colors.primary]}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Text style={styles.title}>CleanSweep</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => router.push('/settings')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.settingsIcon}>⚙</Text>
                    </TouchableOpacity>
                </View>



                {/* RAM Gauge */}
                <View style={styles.gaugeSection}>
                    {memory ? (
                        <RamGauge
                            percentage={memory.usedPercent}
                            usedMB={memory.usedMB}
                            totalMB={memory.totalMB}
                        />
                    ) : (
                        <View style={styles.gaugePlaceholder}>
                            <Text style={styles.loadingText}>Reading memory…</Text>
                        </View>
                    )}
                </View>

                {/* Clean Button */}
                <View style={styles.buttonSection}>
                    <CleanButton
                        onPress={handleClean}
                        isLoading={isCleaning}
                        disabled={isLoading || !memory}
                        freedMB={lastCleanResult?.freedMB ?? null}
                    />
                </View>

                {/* Memory Breakdown */}
                {memory && (
                    <View style={styles.cardsSection}>
                        <MemoryCard
                            usedMB={memory.usedMB}
                            freeMB={memory.freeMB}
                            cachedMB={memory.cachedMB}
                            totalMB={memory.totalMB}
                        />
                    </View>
                )}

                {/* Running Processes */}
                {processes.length > 0 && (
                    <ProcessList
                        processes={processes}
                        onStopProcess={handleStopProcess}
                        maxItems={8}
                    />
                )}

                {/* Bottom spacing */}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingBottom: Spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    greeting: {
        fontSize: FontSize.sm,
        color: Colors.textTertiary,
        fontWeight: FontWeight.medium,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginTop: 2,
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsIcon: {
        fontSize: 20,
    },

    gaugeSection: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    gaugePlaceholder: {
        width: 220,
        height: 220,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: FontSize.md,
        color: Colors.textTertiary,
    },
    buttonSection: {
        alignItems: 'center',
        paddingBottom: Spacing.xl,
    },
    cardsSection: {
        marginTop: Spacing.sm,
    },
    bottomSpacer: {
        height: Spacing.xxl,
    },
});
