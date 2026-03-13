/**
 * Memory Service
 * Reads device memory info and provides RAM usage data.
 * Uses standard Android APIs (no root required).
 */

import { Platform, NativeModules } from 'react-native';
import { killAllBackgroundProcesses } from './root';

const { CleanerModule } = NativeModules;

export interface MemoryInfo {
    totalMB: number;
    usedMB: number;
    freeMB: number;
    availableMB: number;
    cachedMB: number;
    usedPercent: number;
    freePercent: number;
}

export interface CleanResult {
    freedMB: number;
    before: MemoryInfo;
    after: MemoryInfo;
    success: boolean;
    message: string;
}

// ─── Mock data for development / web ──────────────────────────────

let _mockUsed = 3800;

function getMockMemory(): MemoryInfo {
    const totalMB = 6144; // 6 GB
    const usedMB = _mockUsed + Math.floor(Math.random() * 100);
    const cachedMB = 1200;
    const freeMB = totalMB - usedMB;
    const availableMB = freeMB + cachedMB * 0.8;
    const usedPercent = Math.round((usedMB / totalMB) * 100);

    return {
        totalMB: Math.round(totalMB),
        usedMB: Math.round(usedMB),
        freeMB: Math.round(freeMB),
        availableMB: Math.round(availableMB),
        cachedMB: Math.round(cachedMB),
        usedPercent,
        freePercent: 100 - usedPercent,
    };
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Read current RAM usage.
 * On Android: uses ActivityManager.MemoryInfo via native module.
 * On web/dev: uses mock data.
 */
export async function getMemoryInfo(): Promise<MemoryInfo> {
    if (Platform.OS === 'android' && CleanerModule) {
        try {
            const info = await CleanerModule.getMemoryInfo();
            const totalMB = Math.round(info.totalMB);
            const availableMB = Math.round(info.availableMB);
            const usedMB = totalMB - availableMB;
            const cachedMB = Math.round(info.cachedMB ?? 0);
            const freeMB = availableMB;
            const usedPercent = totalMB > 0 ? Math.round((usedMB / totalMB) * 100) : 0;

            return { totalMB, usedMB, freeMB, availableMB, cachedMB, usedPercent, freePercent: 100 - usedPercent };
        } catch {
            return getMockMemory();
        }
    }

    return getMockMemory();
}

/**
 * Perform RAM cleaning:
 * 1. Kill all background processes via ActivityManager
 * 2. Re-read memory info
 */
export async function cleanMemory(): Promise<CleanResult> {
    const before = await getMemoryInfo();

    try {
        // Kill background processes (standard Android API)
        await killAllBackgroundProcesses();

        // Brief delay to let OS reclaim memory
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // For mock/web mode, simulate freeing some memory
        if (Platform.OS !== 'android' || !CleanerModule) {
            _mockUsed = Math.max(2400, _mockUsed - 500 - Math.floor(Math.random() * 300));
        }

        // Read new memory state
        const after = await getMemoryInfo();
        const freedMB = Math.max(0, before.usedMB - after.usedMB);

        return {
            freedMB: Math.round(freedMB),
            before,
            after,
            success: true,
            message: freedMB > 0
                ? `Freed ${Math.round(freedMB)} MB of RAM`
                : 'RAM optimized — no significant memory to free',
        };
    } catch (error: any) {
        return {
            freedMB: 0,
            before,
            after: before,
            success: false,
            message: error?.message ?? 'Failed to clean memory',
        };
    }
}
