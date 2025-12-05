import { useState, useRef, useCallback } from 'react';

export const useWebcam = (
    selectedDeviceId: string,
    updateDeviceStatus: (deviceId: string, inUse: boolean) => void,
) => {
    const [showVideoPreview, setShowVideoPreview] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const currentStreamRef = useRef<MediaStream | null>(null);

    const stopCurrentStream = useCallback(() => {
        if (!currentStreamRef.current) return;
        currentStreamRef.current.getTracks().forEach((track) => track.stop());
        currentStreamRef.current = null;
    }, []);

    const startStream = useCallback(
        async (deviceId?: string) => {
            setPreviewError(null); // Clear previous errors
            try {
                stopCurrentStream();

                const constraints: MediaStreamConstraints = {
                    audio: false,
                    video: deviceId ? { deviceId: { exact: deviceId } } : true,
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                currentStreamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current
                        .play()
                        .catch((e) => console.error('Error playing video:', e));
                }

                // If successful, mark as not in use
                if (deviceId) {
                    updateDeviceStatus(deviceId, false);
                }
            } catch (error: any) {
                console.error('Error starting video stream:', error);

                // Set user-friendly error message
                let errorMessage = 'Failed to start video stream.';
                if (
                    error.name === 'NotReadableError' ||
                    error.name === 'TrackStartError'
                ) {
                    errorMessage = 'Camera is in use by another application.';
                } else if (
                    error.name === 'NotAllowedError' ||
                    error.name === 'PermissionDeniedError'
                ) {
                    errorMessage = 'Camera permission denied.';
                } else if (
                    error.name === 'NotFoundError' ||
                    error.name === 'DevicesNotFoundError'
                ) {
                    errorMessage = 'Camera not found.';
                }
                setPreviewError(errorMessage);

                // If failed, mark as in use
                if (deviceId && deviceId !== selectedDeviceId) {
                    updateDeviceStatus(deviceId, true);
                }
            }
        },
        [stopCurrentStream, selectedDeviceId, updateDeviceStatus],
    );

    const toggleVideoPreview = useCallback(() => {
        setShowVideoPreview((prev) => !prev);
        setPreviewError(null); // Clear error on toggle
    }, []);

    return {
        videoRef,
        currentStreamRef,
        showVideoPreview,
        previewError,
        startStream,
        stopCurrentStream,
        toggleVideoPreview,
    };
};
