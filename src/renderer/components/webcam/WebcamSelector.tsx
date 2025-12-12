import React, { useEffect, useRef } from 'react';
import { WebcamSelectorProps, CaptureMode } from '../../types/webcam';
import { useDeviceList } from '../../hooks/useDeviceList';
import { useWebcam } from '../../hooks/useWebcam';
import { useImageCapture } from '../../hooks/useImageCapture';
import { useCropEditor } from '../../hooks/useCropEditor';
import { useGlobalHotkey } from '../../hooks/useGlobalHotkey';
import { CameraControls } from './CameraControls';
import { CaptureSettings } from './CaptureSettings';
import { VideoPreviewModal } from './VideoPreviewModal';

const WebcamSelector: React.FC<WebcamSelectorProps> = ({
    selectedCamera,
    onCameraChange,
}) => {
    // Device management
    const {
        devices,
        selectedDeviceId,
        refreshDevices,
        handleSelectChange,
        updateDeviceStatus,
    } = useDeviceList(onCameraChange);

    // Webcam stream
    const {
        videoRef,
        currentStreamRef,
        showVideoPreview,
        previewError,
        startStream,
        stopCurrentStream,
        toggleVideoPreview,
    } = useWebcam(selectedDeviceId, updateDeviceStatus);

    const [captureMode, setCaptureMode] = React.useState<CaptureMode>('local');
    const [apiKey, setApiKey] = React.useState('');
    const [apiUrl, setApiUrl] = React.useState('');

    // Image capture
    const { captureImage, captureStatus, imageCropRef } =
        useImageCapture(videoRef, captureMode, apiKey, apiUrl);

    // Crop editor
    const {
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
    } = useCropEditor(videoRef, imageCropRef, toggleVideoPreview, showVideoPreview);

    // Global hotkey
    const { captureKey, isRecordingKey, setIsRecordingKey } =
        useGlobalHotkey(captureImage);

    // Debounce ref for device changes
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial device load
    useEffect(() => {
        refreshDevices();

        const handleDeviceChange = () => {
            // Debounce logic
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                refreshDevices();
            }, 500); // Debounce for 500ms
        };

        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

        return () => {
            navigator.mediaDevices.removeEventListener(
                'devicechange',
                handleDeviceChange,
            );
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            stopCurrentStream();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Stream management
    useEffect(() => {
        if (selectedCamera) {
            startStream(selectedCamera.deviceId);
        } else {
            stopCurrentStream();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCamera]);

    return (
        <section className="section">
            <div className="container">
                {/* Title */}
                <h1 className="title is-4">Webcam Selector</h1>

                {captureStatus && (
                    <div
                        className="notification is-success"
                        style={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            zIndex: 9999,
                            width: 'auto',
                            minWidth: '200px',
                            textAlign: 'center',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        }}
                    >
                        {captureStatus}
                    </div>
                )}

                <CameraControls
                    devices={devices}
                    selectedDeviceId={selectedDeviceId}
                    onSelectChange={handleSelectChange}
                    onRefresh={() => refreshDevices()}
                    onShowPreview={toggleVideoPreview}
                    onEditCrop={toggleCropMode}
                    isCropMode={isCropMode}
                />

                <CaptureSettings
                    captureKey={captureKey}
                    isRecordingKey={isRecordingKey}
                    onSetRecordingKey={setIsRecordingKey}
                    imageCrop={imageCrop}
                    onClearCrop={clearCrop}
                    captureMode={captureMode}
                    onSetCaptureMode={setCaptureMode}
                    apiKey={apiKey}
                    onSetApiKey={setApiKey}
                    apiUrl={apiUrl}
                    onSetApiUrl={setApiUrl}
                />

                <VideoPreviewModal
                    show={showVideoPreview}
                    videoRef={videoRef}
                    previewError={previewError}
                    isCropMode={isCropMode}
                    cropStart={cropStart}
                    cropCurrent={cropCurrent}
                    onClose={toggleVideoPreview}
                    onSaveCrop={saveCrop}
                    onCancelCrop={toggleCropMode}
                    onMouseDown={handleVideoMouseDown}
                    onMouseMove={handleVideoMouseMove}
                    onMouseUp={handleVideoMouseUp}
                />
            </div>
        </section>
    );
};

export default WebcamSelector;
