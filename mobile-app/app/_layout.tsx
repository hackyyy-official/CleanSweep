/**
 * Root Layout — Expo Router
 * Minimal navigation with clean white status bar
 */

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontWeight, FontSize } from '../constants/theme';

export default function RootLayout() {
    return (
        <>
            <StatusBar style="dark" backgroundColor={Colors.background} />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: Colors.background,
                    },
                    headerTintColor: Colors.textPrimary,
                    headerTitleStyle: {
                        fontWeight: FontWeight.semibold,
                        fontSize: FontSize.lg,
                    },
                    headerShadowVisible: false,
                    contentStyle: {
                        backgroundColor: Colors.background,
                    },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        title: 'CleanSweep',
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="settings"
                    options={{
                        title: 'Settings',
                        presentation: 'card',
                    }}
                />
            </Stack>
        </>
    );
}
