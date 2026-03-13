/**
 * CleanButton — Premium pill-shaped 'Optimize' button
 * Pastel blue fill with haptic feedback and loading state
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, BorderRadius, Shadows, Spacing } from '../constants/theme';

interface CleanButtonProps {
    onPress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    label?: string;
    freedMB?: number | null;
}

export function CleanButton({
    onPress,
    isLoading = false,
    disabled = false,
    label = 'Optimize',
    freedMB = null,
}: CleanButtonProps) {
    const handlePress = async () => {
        if (isLoading || disabled) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    const showResult = freedMB !== null && !isLoading;

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity
                style={[
                    styles.button,
                    isLoading && styles.buttonLoading,
                    disabled && styles.buttonDisabled,
                ]}
                onPress={handlePress}
                activeOpacity={0.8}
                disabled={isLoading || disabled}
            >
                {isLoading ? (
                    <View style={styles.loadingContent}>
                        <ActivityIndicator size="small" color={Colors.textOnPrimary} />
                        <Text style={styles.buttonText}>Cleaning…</Text>
                    </View>
                ) : (
                    <Text style={styles.buttonText}>{label}</Text>
                )}
            </TouchableOpacity>

            {showResult && (
                <Text style={styles.resultText}>
                    {freedMB! > 0 ? `✓ Freed ${freedMB} MB` : '✓ Already optimized'}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xxl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.pill,
        minWidth: 200,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.button,
    },
    buttonLoading: {
        backgroundColor: Colors.primaryDark,
    },
    buttonDisabled: {
        backgroundColor: Colors.border,
    },
    loadingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    buttonText: {
        color: Colors.textOnPrimary,
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
        letterSpacing: 0.5,
    },
    resultText: {
        color: Colors.success,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
    },
});
