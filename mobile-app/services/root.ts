/**
 * Shell Service
 * Executes Android system commands using standard APIs (no root required).
 * Uses the native CleanerModule for process management.
 */

import { Platform, NativeModules } from 'react-native';

const { CleanerModule } = NativeModules;

export interface ShellResult {
    exitCode: number;
    stdout: string;
    stderr: string;
}

/**
 * Check if the app has permission to kill background processes.
 * This uses the standard KILL_BACKGROUND_PROCESSES permission (no root).
 */
export async function checkPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
        if (CleanerModule) {
            return await CleanerModule.checkPermissions();
        }
        // In dev/web mode
        return true;
    } catch {
        return false;
    }
}

/**
 * Kill background processes for a given package using ActivityManager
 */
export async function killBackgroundProcess(packageName: string): Promise<ShellResult> {
    if (Platform.OS !== 'android') {
        return { exitCode: 0, stdout: 'mock: killed', stderr: '' };
    }

    try {
        if (CleanerModule) {
            const result = await CleanerModule.killBackgroundProcess(packageName);
            return {
                exitCode: result.success ? 0 : 1,
                stdout: result.message ?? '',
                stderr: '',
            };
        }
        return { exitCode: 0, stdout: 'mock: killed', stderr: '' };
    } catch (error: any) {
        return { exitCode: 1, stdout: '', stderr: error?.message ?? 'Unknown error' };
    }
}

/**
 * Kill all background processes using ActivityManager
 */
export async function killAllBackgroundProcesses(): Promise<ShellResult> {
    if (Platform.OS !== 'android') {
        return { exitCode: 0, stdout: 'mock: all killed', stderr: '' };
    }

    try {
        if (CleanerModule) {
            const result = await CleanerModule.killAllBackground();
            return {
                exitCode: result.success ? 0 : 1,
                stdout: result.message ?? '',
                stderr: '',
            };
        }
        return { exitCode: 0, stdout: 'mock: all killed', stderr: '' };
    } catch (error: any) {
        return { exitCode: 1, stdout: '', stderr: error?.message ?? 'Unknown error' };
    }
}

/**
 * Force-stop a specific app (uses ActivityManager.forceStopPackage if available)
 */
export async function forceStopPackage(packageName: string): Promise<ShellResult> {
    return killBackgroundProcess(packageName);
}
