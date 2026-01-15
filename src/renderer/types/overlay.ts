export type OverlayMode = 'overlay-only' | 'webcam-overlay';

export type OverlayPosition = {
    x: number;
    y: number;
    anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
};

export type CardData = {
    name: string;
    price: string;
    set?: string;
    rarity?: string;
    timestamp?: number;
};

export type OverlayConfig = {
    mode: OverlayMode;
    position: OverlayPosition;
    customCss: string;
    port: number;
    deviceId?: string;
};

export type OverlayServerStatus = {
    running: boolean;
    port: number;
    urls: {
        overlay: string;
        webcamOverlay: string;
    };
    error?: string;
};
