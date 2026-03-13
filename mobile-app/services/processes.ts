/**
 * Process Service
 * Lists running processes and identifies cleanup targets.
 * Uses standard Android APIs (no root required).
 */

import { Platform, NativeModules } from 'react-native';
import { killBackgroundProcess } from './root';

const { CleanerModule } = NativeModules;

export interface ProcessInfo {
    pid: number;
    packageName: string;
    displayName: string;
    memoryKB: number;
    isProtected: boolean;
}

// ─── Protected system packages (never killed) ─────────────────────

const PROTECTED_PACKAGES = new Set([
    'com.android.systemui',
    'com.android.phone',
    'com.android.settings',
    'com.android.inputmethod.latin',
    'com.android.launcher',
    'com.android.launcher3',
    'com.google.android.gms',
    'com.google.android.gsf',
    'com.google.android.inputmethod.latin',
    'com.google.android.packageinstaller',
    'com.google.android.permissioncontroller',
    'com.google.android.providers.media.module',
    'com.android.providers.media',
    'com.android.providers.settings',
    'com.android.providers.contacts',
    'com.android.bluetooth',
    'com.android.nfc',
    'com.android.shell',
    'com.android.se',
    'system',
    'android',
]);

// ─── Mock data for development / web ────────────────────────────

const MOCK_PROCESSES: ProcessInfo[] = [
    { pid: 12451, packageName: 'com.spotify.music', displayName: 'Spotify', memoryKB: 185400, isProtected: false },
    { pid: 8912, packageName: 'com.whatsapp', displayName: 'WhatsApp', memoryKB: 142300, isProtected: false },
    { pid: 14201, packageName: 'com.instagram.android', displayName: 'Instagram', memoryKB: 198700, isProtected: false },
    { pid: 7823, packageName: 'com.twitter.android', displayName: 'X (Twitter)', memoryKB: 167800, isProtected: false },
    { pid: 9134, packageName: 'com.discord', displayName: 'Discord', memoryKB: 134200, isProtected: false },
    { pid: 11023, packageName: 'com.google.android.youtube', displayName: 'YouTube', memoryKB: 223100, isProtected: false },
    { pid: 5432, packageName: 'com.snapchat.android', displayName: 'Snapchat', memoryKB: 178900, isProtected: false },
    { pid: 6789, packageName: 'com.facebook.katana', displayName: 'Facebook', memoryKB: 256400, isProtected: false },
];

// ─── Public API ──────────────────────────────────────────────────

/**
 * List running processes/apps.
 * On Android: uses ActivityManager.getRunningAppProcesses() via native module.
 * On web/dev: returns mock data.
 */
export async function getRunningProcesses(): Promise<ProcessInfo[]> {
    if (Platform.OS === 'android' && CleanerModule) {
        try {
            const procs = await CleanerModule.getRunningProcesses();
            return procs
                .map((p: any) => ({
                    pid: p.pid,
                    packageName: p.packageName,
                    displayName: p.displayName ?? p.packageName.split('.').pop() ?? p.packageName,
                    memoryKB: p.memoryKB ?? 0,
                    isProtected: PROTECTED_PACKAGES.has(p.packageName) ||
                        p.packageName.startsWith('com.android.') ||
                        p.packageName.startsWith('android.'),
                }))
                .filter((p: ProcessInfo) => !p.isProtected && p.memoryKB > 0)
                .sort((a: ProcessInfo, b: ProcessInfo) => b.memoryKB - a.memoryKB);
        } catch {
            return MOCK_PROCESSES;
        }
    }

    return MOCK_PROCESSES;
}

/**
 * Kill a specific app's background processes
 */
export async function stopProcess(packageName: string): Promise<boolean> {
    try {
        const result = await killBackgroundProcess(packageName);
        return result.exitCode === 0;
    } catch {
        return false;
    }
}
