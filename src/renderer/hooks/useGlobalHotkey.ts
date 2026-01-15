import { useState, useEffect, useCallback, useRef } from 'react';

export const useGlobalHotkey = (captureImage: () => void) => {
    const [captureKey, setCaptureKey] = useState<string>('F8');
    const [isRecordingKey, setIsRecordingKey] = useState<boolean>(false);

    // Keep latest captureImage in strict ref to avoid re-running effects
    const captureImageRef = useRef(captureImage);
    useEffect(() => {
        captureImageRef.current = captureImage;
    }, [captureImage]);

    // Handle local keyboard events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isRecordingKey) {
                if (e.key === 'Escape') {
                    setIsRecordingKey(false);
                    return;
                }

                setCaptureKey(e.key);
                setIsRecordingKey(false);
                e.preventDefault();
                return;
            }

            if (e.key === captureKey) {
                captureImageRef.current();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [captureKey, isRecordingKey]);

    // Register global shortcut and listen for trigger
    useEffect(() => {
        // Register the global shortcut
        window.electron.ipcRenderer.sendMessage(
            'register-global-shortcut',
            captureKey,
        );

        // Listen for capture trigger from main process
        const unsubscribe = window.electron.ipcRenderer.onCapture(() => {
            captureImageRef.current();
        });

        return () => {
            unsubscribe();
            window.electron.ipcRenderer.sendMessage('unregister-global-shortcut');
        };
    }, [captureKey]);

    return {
        captureKey,
        isRecordingKey,
        setIsRecordingKey,
    };
};
