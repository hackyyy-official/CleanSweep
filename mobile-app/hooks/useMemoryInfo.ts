/**
 * useMemoryInfo Hook
 * Polls RAM usage periodically and provides cleaning state.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getMemoryInfo, cleanMemory, MemoryInfo, CleanResult } from '../services/memory';

interface UseMemoryInfoReturn {
    memory: MemoryInfo | null;
    isLoading: boolean;
    isCleaning: boolean;
    lastCleanResult: CleanResult | null;
    refresh: () => Promise<void>;
    clean: () => Promise<CleanResult>;
}

const POLL_INTERVAL = 3000; // 3 seconds

export function useMemoryInfo(): UseMemoryInfoReturn {
    const [memory, setMemory] = useState<MemoryInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCleaning, setIsCleaning] = useState(false);
    const [lastCleanResult, setLastCleanResult] = useState<CleanResult | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const refresh = useCallback(async () => {
        try {
            const info = await getMemoryInfo();
            setMemory(info);
        } catch (error) {
            console.error('[useMemoryInfo] Failed to get memory info:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clean = useCallback(async (): Promise<CleanResult> => {
        setIsCleaning(true);
        try {
            const result = await cleanMemory();
            setLastCleanResult(result);
            setMemory(result.after);
            return result;
        } finally {
            setIsCleaning(false);
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        refresh();

        // Start polling
        intervalRef.current = setInterval(refresh, POLL_INTERVAL);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [refresh]);

    return { memory, isLoading, isCleaning, lastCleanResult, refresh, clean };
}
