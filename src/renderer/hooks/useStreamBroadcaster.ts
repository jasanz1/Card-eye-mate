import { useEffect, useRef } from 'react';
import { useOverlayServer } from './useOverlayServer';

export const useStreamBroadcaster = (
    videoRef: React.RefObject<HTMLVideoElement | null>,
    enabled: boolean = true
) => {
    const { serverStatus } = useOverlayServer();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const lastFrameTimeRef = useRef<number>(0);

    // Ensure canvas element is created and assigned to ref
    useEffect(() => {
        if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
        }
    }, []);

    useEffect(() => {
        // Only run if enabled, video exists, server is running
        if (!enabled || !videoRef.current || !serverStatus?.running) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            return;
        }

        const broadcastFrame = (timestamp: number) => {
            // Target ~60fps (approx 16ms) - virtually no throttle needed for local
            if (timestamp - lastFrameTimeRef.current < 16) {
                animationFrameRef.current = requestAnimationFrame(broadcastFrame);
                return;
            }

            if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
                // Ensure canvas matches video resolution
                if (canvasRef.current.width !== videoRef.current.videoWidth ||
                    canvasRef.current.height !== videoRef.current.videoHeight) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                }

                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                    // High quality JPEG for local streaming
                    const frameData = canvasRef.current.toDataURL('image/jpeg', 0.9);
                    window.electron.ipcRenderer.sendMessage('broadcast-video-frame', frameData);
                }
                lastFrameTimeRef.current = timestamp;
            }

            animationFrameRef.current = requestAnimationFrame(broadcastFrame);
        };

        animationFrameRef.current = requestAnimationFrame(broadcastFrame);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [enabled, serverStatus?.running, videoRef]);
};

