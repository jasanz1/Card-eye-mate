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

    // Create hidden canvas once
    useEffect(() => {
        if (!canvasRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = 854; // 480p equivalent (16:9) - good balance of quality/perf
            canvas.height = 480;
            canvasRef.current = canvas;
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
            // Target ~24fps to reduce IPC/CPU load (approx 41ms per frame)
            if (timestamp - lastFrameTimeRef.current < 41) {
                animationFrameRef.current = requestAnimationFrame(broadcastFrame);
                return;
            }

            if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                    // Use JPEG with 0.6 quality for lower bandwidth
                    const frameData = canvasRef.current.toDataURL('image/jpeg', 0.6);
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
