import { useState, useRef, useCallback } from 'react';
import { ImageCrop } from '../types/webcam';

export const useImageCapture = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
    const [captureStatus, setCaptureStatus] = useState<string | null>(null);
    const imageCropRef = useRef<ImageCrop | null>(null);

    const captureImage = useCallback(() => {
        if (videoRef.current && videoRef.current.readyState === 4) {
            try {
                const canvas = document.createElement('canvas');
                const currentCrop = imageCropRef.current;
                canvas.width = currentCrop
                    ? currentCrop.width
                    : videoRef.current.videoWidth;
                canvas.height = currentCrop
                    ? currentCrop.height
                    : videoRef.current.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    if (currentCrop) {
                        // Use 9-parameter drawImage: source x, y, width, height, dest x, y, width, height
                        ctx.drawImage(
                            videoRef.current,
                            currentCrop.x,
                            currentCrop.y,
                            currentCrop.width,
                            currentCrop.height,
                            0,
                            0,
                            currentCrop.width,
                            currentCrop.height,
                        );
                    } else {
                        // No crop, draw entire video
                        ctx.drawImage(videoRef.current, 0, 0);
                    }
                    const dataUrl = canvas.toDataURL('image/png');
                    window.electron.ipcRenderer.sendMessage('save-image', dataUrl);
                    setCaptureStatus('Captured!');
                    setTimeout(() => setCaptureStatus(null), 2000);
                }
            } catch (e) {
                console.error('Error capturing image:', e);
                setCaptureStatus('Error!');
                setTimeout(() => setCaptureStatus(null), 2000);
            }
        }
    }, [videoRef]);

    return {
        captureImage,
        captureStatus,
        imageCropRef,
    };
};
