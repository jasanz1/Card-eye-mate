import { useState, useEffect, useCallback } from 'react';
import {
    OverlayServerStatus,
    OverlayConfig,
    CardData,
} from '../types/overlay';

interface UseOverlayServerReturn {
    serverStatus: OverlayServerStatus | null;
    isStarting: boolean;
    error: string | null;
    startServer: (port: number) => void;
    stopServer: () => void;
    updateCardData: (data: CardData) => void;
    updateConfig: (config: Partial<OverlayConfig>) => void;
    refreshStatus: () => void;
}

export const useOverlayServer = (): UseOverlayServerReturn => {
    const [serverStatus, setServerStatus] = useState<OverlayServerStatus | null>(
        null,
    );
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleServerStatus = useCallback(
        (response: any) => {
            setIsStarting(false);

            if (response && response.success) {
                if (response.status) {
                    setServerStatus(response.status);
                    setError(null);
                }
            } else {
                setError(response?.error || 'Unknown error occurred');
            }
        },
        [],
    );

    useEffect(() => {
        // Listen for server status updates
        const removeListener = window.electron.ipcRenderer.on(
            'overlay-server-status',
            handleServerStatus,
        );

        // Get initial status
        window.electron.ipcRenderer.sendMessage('get-overlay-status');

        return () => {
            if (removeListener) {
                removeListener();
            }
        };
    }, [handleServerStatus]);

    const startServer = useCallback((port: number = 3030) => {
        setIsStarting(true);
        setError(null);
        window.electron.ipcRenderer.sendMessage('start-overlay-server', { port });
    }, []);

    const stopServer = useCallback(() => {
        setIsStarting(true);
        setError(null);
        window.electron.ipcRenderer.sendMessage('stop-overlay-server');
    }, []);

    const updateCardData = useCallback((data: CardData) => {
        window.electron.ipcRenderer.sendMessage('update-overlay-data', data);
    }, []);

    const updateConfig = useCallback((config: Partial<OverlayConfig>) => {
        window.electron.ipcRenderer.sendMessage('update-overlay-config', config);
    }, []);

    const refreshStatus = useCallback(() => {
        window.electron.ipcRenderer.sendMessage('get-overlay-status');
    }, []);

    return {
        serverStatus,
        isStarting,
        error,
        startServer,
        stopServer,
        updateCardData,
        updateConfig,
        refreshStatus,
    };
};
