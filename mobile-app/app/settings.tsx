/**
 * Settings Screen
 * Clean, minimalist settings with toggles and info
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Linking,
    Alert,
} from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../constants/theme';

interface SettingRowProps {
    label: string;
    description?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    onPress?: () => void;
    rightText?: string;
    showChevron?: boolean;
}

function SettingRow({
    label,
    description,
    value,
    onValueChange,
    onPress,
    rightText,
    showChevron,
}: SettingRowProps) {
    const Wrapper = onPress ? TouchableOpacity : View;

    return (
        <Wrapper
            style={styles.settingRow}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>{label}</Text>
                {description && (
                    <Text style={styles.settingDescription}>{description}</Text>
                )}
            </View>
            {value !== undefined && onValueChange && (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={value ? Colors.primary : Colors.textTertiary}
                />
            )}
            {rightText && <Text style={styles.settingRight}>{rightText}</Text>}
            {showChevron && <Text style={styles.chevron}>›</Text>}
        </Wrapper>
    );
}

function SectionHeader({ title }: { title: string }) {
    return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
    const [autoClean, setAutoClean] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [aggressiveMode, setAggressiveMode] = useState(false);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Permission Status */}
            <View style={styles.statusCard}>
                <View style={styles.statusRow}>
                    <View
                        style={[
                            styles.statusDot,
                            { backgroundColor: Colors.success },
                        ]}
                    />
                    <Text style={styles.statusText}>
                        Permissions granted
                    </Text>
                </View>
                <Text style={styles.statusDescription}>
                    CleanSweep can manage background apps and optimize RAM.
                </Text>
            </View>

            {/* General Settings */}
            <SectionHeader title="General" />
            <View style={styles.section}>
                <SettingRow
                    label="Auto-Clean on Launch"
                    description="Automatically optimize RAM when app opens"
                    value={autoClean}
                    onValueChange={setAutoClean}
                />
                <View style={styles.divider} />
                <SettingRow
                    label="Notifications"
                    description="Alert when RAM usage exceeds 80%"
                    value={notifications}
                    onValueChange={setNotifications}
                />
                <View style={styles.divider} />
                <SettingRow
                    label="Aggressive Mode"
                    description="Also clear filesystem caches for maximum RAM"
                    value={aggressiveMode}
                    onValueChange={setAggressiveMode}
                />
            </View>

            {/* Protected Apps */}
            <SectionHeader title="Protected Apps" />
            <View style={styles.section}>
                <SettingRow
                    label="Manage Whitelist"
                    description="Apps that are never force-stopped"
                    showChevron
                    onPress={() =>
                        Alert.alert('Coming Soon', 'Protected apps management will be available in a future update.')
                    }
                />
            </View>

            {/* About */}
            <SectionHeader title="About" />
            <View style={styles.section}>
                <SettingRow label="Version" rightText="1.0.0" />
                <View style={styles.divider} />
                <SettingRow label="Build" rightText="2026.02" />
                <View style={styles.divider} />
                <SettingRow
                    label="Source Code"
                    showChevron
                    onPress={() =>
                        Linking.openURL('https://github.com/hackyyy-official/CleanSweep')
                    }
                />
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
                CleanSweep Mobile{'\n'}
                Made with ❤️
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl * 2,
    },
    statusCard: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        ...Shadows.card,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    statusText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: Colors.textPrimary,
    },
    statusDescription: {
        fontSize: FontSize.sm,
        color: Colors.textTertiary,
        marginTop: Spacing.sm,
        lineHeight: 20,
    },
    sectionHeader: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
        color: Colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    section: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.card,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        minHeight: 52,
    },
    settingLeft: {
        flex: 1,
        marginRight: Spacing.md,
    },
    settingLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: Colors.textPrimary,
    },
    settingDescription: {
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        marginTop: 2,
        lineHeight: 16,
    },
    settingRight: {
        fontSize: FontSize.md,
        color: Colors.textTertiary,
        fontWeight: FontWeight.medium,
    },
    chevron: {
        fontSize: 22,
        color: Colors.textTertiary,
        fontWeight: FontWeight.medium,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.borderLight,
        marginHorizontal: Spacing.md,
    },
    footer: {
        textAlign: 'center',
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        marginTop: Spacing.xxl,
        lineHeight: 18,
    },
});
