import { useState, useEffect, useCallback } from 'react';

export const useGlobalHotkey = (captureImage: () => void) => {
    const [captureKey, setCaptureKey] = useState<string>('c');
    const [isRecordingKey, setIsRecordingKey] = useState<boolean>(false);

    // Handle local keyboard events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isRecordingKey) {
                setCaptureKey(e.key);
                setIsRecordingKey(false);
                e.preventDefault();
                return;
            }

            if (e.key === captureKey) {
                captureImage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [captureKey, isRecordingKey, captureImage]);

    // Register global shortcut and listen for trigger
    useEffect(() => {
        // Register the global shortcut
        window.electron.ipcRenderer.sendMessage(
            'register-global-shortcut',
            captureKey,
        );

        // Listen for capture trigger from main process
        const unsubscribe = window.electron.ipcRenderer.onCapture(() => {
            captureImage();
        });

        return () => {
            unsubscribe();
            window.electron.ipcRenderer.sendMessage('unregister-global-shortcut');
        };
    }, [captureKey, captureImage]);

    return {
        captureKey,
        isRecordingKey,
        setIsRecordingKey,
    };
};
