import { useState, useCallback } from 'react';
import { VideoDevice } from '../types/webcam';

export const useDeviceList = (
    onCameraChange: (device: VideoDevice | null) => void,
) => {
    const [devices, setDevices] = useState<VideoDevice[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

    const refreshDevices = useCallback(
        async (retryCount = 0) => {
            try {
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                const videoInputDevices = allDevices.filter(
                    (d) => d.kind === 'videoinput',
                );

                // Retry logic: if no devices found and we haven't retried too many times, wait and try again
                // This helps with race conditions on startup where devices aren't ready yet
                if (videoInputDevices.length === 0 && retryCount < 2) {
                    console.log(`No devices found, retrying... (${retryCount + 1}/2)`);
                    setTimeout(() => refreshDevices(retryCount + 1), 500);
                    return;
                }

                // Map devices directly without checking if they are in use (no probing)
                const devicesList: VideoDevice[] = videoInputDevices.map(
                    (d, index) => ({
                        deviceId: d.deviceId,
                        label: d.label || `Camera ${index + 1}`,
                        inUse: false, // Assume available since we are not probing
                    }),
                );

                setDevices(devicesList);

                // Preserve selected device if it still exists, otherwise select first available
                if (devicesList.length > 0) {
                    const currentStillExists = devicesList.find(
                        (d) => d.deviceId === selectedDeviceId,
                    );

                    if (!currentStillExists) {
                        // Prefer a device that is NOT in use
                        const firstAvailable =
                            devicesList.find((d) => !d.inUse) || devicesList[0];
                        setSelectedDeviceId(firstAvailable.deviceId);
                        onCameraChange(firstAvailable);
                    }
                } else {
                    // No devices found
                    if (selectedDeviceId) {
                        setSelectedDeviceId('');
                        onCameraChange(null);
                    }
                }
            } catch (error) {
                console.error('Error refreshing devices:', error);
            }
        },
        [selectedDeviceId, onCameraChange],
    );

    const handleSelectChange = useCallback(
        (deviceId: string) => {
            setSelectedDeviceId(deviceId);
            const device = devices.find((d) => d.deviceId === deviceId);
            if (device) {
                onCameraChange(device);
            }
        },
        [devices, onCameraChange],
    );

    const updateDeviceStatus = useCallback(
        (deviceId: string, inUse: boolean) => {
            setDevices((prev) =>
                prev.map((d) => (d.deviceId === deviceId ? { ...d, inUse } : d)),
            );
        },
        [],
    );

    return {
        devices,
        selectedDeviceId,
        refreshDevices,
        handleSelectChange,
        updateDeviceStatus,
    };
};
