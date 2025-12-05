export type VideoDevice = {
    deviceId: string;
    label: string;
    inUse: boolean;
};

export type ImageCrop = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type WebcamSelectorProps = {
    selectedCamera: VideoDevice | null;
    onCameraChange: (device: VideoDevice | null) => void;
};
