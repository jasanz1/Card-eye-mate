import { useState, useCallback, useEffect } from 'react';
import { ImageCrop } from '../types/webcam';

export const useCropEditor = (
    videoRef: React.RefObject<HTMLVideoElement | null>,
    imageCropRef: React.MutableRefObject<ImageCrop | null>,
    toggleVideoPreview: () => void,
    showVideoPreview: boolean,
) => {
    const [imageCrop, setImageCrop] = useState<ImageCrop | null>(null);
    const [isCropMode, setIsCropMode] = useState<boolean>(false);
    const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(
        null,
    );
    const [cropCurrent, setCropCurrent] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // Update ref when imageCrop changes
    useEffect(() => {
        imageCropRef.current = imageCrop;
    }, [imageCrop, imageCropRef]);

    const toggleCropMode = useCallback(() => {
        const wasInCropMode = isCropMode;
        setIsCropMode((prev) => !prev);

        // If entering crop mode and preview is not shown, open it
        if (!wasInCropMode && !showVideoPreview) {
            toggleVideoPreview();
        }

        setCropStart(null);
        setCropCurrent(null);
        setIsDragging(false);
    }, [isCropMode, showVideoPreview, toggleVideoPreview]);

    const saveCrop = useCallback(() => {
        if (cropStart && cropCurrent && videoRef.current) {
            const rect = videoRef.current.getBoundingClientRect();
            const scaleX = videoRef.current.videoWidth / rect.width;
            const scaleY = videoRef.current.videoHeight / rect.height;

            const x1 = Math.min(cropStart.x, cropCurrent.x);
            const y1 = Math.min(cropStart.y, cropCurrent.y);
            const x2 = Math.max(cropStart.x, cropCurrent.x);
            const y2 = Math.max(cropStart.y, cropCurrent.y);

            const newCrop = {
                x: Math.round(x1 * scaleX),
                y: Math.round(y1 * scaleY),
                width: Math.round((x2 - x1) * scaleX),
                height: Math.round((y2 - y1) * scaleY),
            };
            setImageCrop(newCrop);
        }
        setIsCropMode(false);
        setCropStart(null);
        setCropCurrent(null);
        toggleVideoPreview();
    }, [cropStart, cropCurrent, videoRef, toggleVideoPreview]);

    const clearCrop = useCallback(() => {
        setImageCrop(null);
    }, []);

    const handleVideoMouseDown = useCallback(
        (e: React.MouseEvent<HTMLVideoElement>) => {
            if (!isCropMode) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            setCropStart(pos);
            setCropCurrent(pos);
            setIsDragging(true);
        },
        [isCropMode],
    );

    const handleVideoMouseMove = useCallback(
        (e: React.MouseEvent<HTMLVideoElement>) => {
            if (!isCropMode || !cropStart || !isDragging) return;
            const rect = e.currentTarget.getBoundingClientRect();
            setCropCurrent({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        },
        [isCropMode, cropStart, isDragging],
    );

    const handleVideoMouseUp = useCallback(() => {
        if (!isCropMode || !cropStart || !cropCurrent) return;
        setIsDragging(false);
    }, [isCropMode, cropStart, cropCurrent]);

    return {
        imageCrop,
        isCropMode,
        cropStart,
        cropCurrent,
        toggleCropMode,
        saveCrop,
        clearCrop,
        handleVideoMouseDown,
        handleVideoMouseMove,
        handleVideoMouseUp,
    };
};
