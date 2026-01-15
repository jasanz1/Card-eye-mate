import React, { useState } from 'react';
import { VideoDevice, ImageCrop, CaptureMode } from '../../types/webcam';

type Props = {
    devices: VideoDevice[];
    selectedDeviceId: string;
    onSelectChange: (deviceId: string) => void;
    onRefresh: () => void;
    onShowPreview: () => void;
    onEditCrop: () => void;
    isCropMode: boolean;
    // Capture Settings Props
    captureKey: string;
    isRecordingKey: boolean;
    onSetRecordingKey: (value: boolean) => void;
    imageCrop: ImageCrop | null;
    onClearCrop: () => void;
    captureMode: CaptureMode;
    onSetCaptureMode: (mode: CaptureMode) => void;
    apiKey: string;
    onSetApiKey: (key: string) => void;
    apiUrl: string;
    onSetApiUrl: (url: string) => void;
};

export const CameraControls: React.FC<Props> = ({
    devices,
    selectedDeviceId,
    onSelectChange,
    onRefresh,
    onShowPreview,
    onEditCrop,
    isCropMode,
    captureKey,
    isRecordingKey,
    onSetRecordingKey,
    imageCrop,
    onClearCrop,
    captureMode,
    onSetCaptureMode,
    apiKey,
    onSetApiKey,
    apiUrl,
    onSetApiUrl,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <>
            {/* Camera Dropdown Row */}
            <div className="card-section">
                <label className="label" htmlFor="camera-select">
                    Camera Selection
                </label>
                <div className="field is-grouped">
                    <div className="control is-expanded">
                        <div className="select is-fullwidth">
                            <select
                                id="camera-select"
                                value={selectedDeviceId}
                                onChange={(e) => onSelectChange(e.target.value)}
                            >
                                {devices.length === 0 && (
                                    <option disabled>No cameras found</option>
                                )}
                                {devices.map((device) => (
                                    <option
                                        key={device.deviceId}
                                        value={device.deviceId}
                                        disabled={device.inUse}
                                    >
                                        {device.label} {device.inUse ? '(in use)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="control">
                        <button
                            type="button"
                            className="button is-info"
                            onClick={onRefresh}
                            title="Refresh camera list"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* Preview & Crop Buttons */}
                <div className="field is-grouped" style={{ marginTop: '0.75rem' }}>
                    <div className="control is-expanded">
                        <button
                            type="button"
                            className="js-modal-trigger button is-primary is-fullwidth"
                            onClick={onShowPreview}
                        >
                            👁️ Show Preview
                        </button>
                    </div>
                    <div className="control is-expanded">
                        <button
                            type="button"
                            className={`button is-fullwidth ${isCropMode ? 'is-warning' : 'is-link'}`}
                            onClick={onEditCrop}
                        >
                            {isCropMode ? '✂️ Exit Crop Mode' : '✂️ Edit Crop'}
                        </button>
                    </div>
                    <div className="control">
                        <button
                            type="button"
                            className="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            title={isExpanded ? 'Hide settings' : 'Show settings'}
                        >
                            {isExpanded ? '▼' : '▶'}
                        </button>
                    </div>
                </div>

                {/* Collapsible Capture Settings */}
                {isExpanded && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        {/* Capture Key + Mode Selection */}
                        <div className="field is-grouped is-align-items-center" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div className="control">
                                <button
                                    type="button"
                                    className={`button ${isRecordingKey ? 'is-warning' : 'is-primary'}`}
                                    onClick={() => onSetRecordingKey(true)}
                                    style={{ minWidth: '180px' }}
                                >
                                    {isRecordingKey ? '⌨️ Press any key...' : `⌨️Capture Key: ${captureKey}`}
                                </button>
                            </div>

                            <div className="control">
                                <div className="field has-addons">
                                    <div className="control">
                                        <button
                                            type="button"
                                            className={`button ${captureMode === 'local' ? 'is-selected is-info' : ''}`}
                                            onClick={() => onSetCaptureMode('local')}
                                        >
                                            💾 Local
                                        </button>
                                    </div>
                                    <div className="control">
                                        <button
                                            type="button"
                                            className={`button ${captureMode === 'api' ? 'is-selected is-info' : ''}`}
                                            onClick={() => onSetCaptureMode('api')}
                                        >
                                            🔗 Card Eye
                                        </button>
                                    </div>
                                    <div className="control">
                                        <button
                                            type="button"
                                            className={`button ${captureMode === 'custom' ? 'is-selected is-info' : ''}`}
                                            onClick={() => onSetCaptureMode('custom')}
                                        >
                                            ⚙️ Custom
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {imageCrop && (
                                <div className="control">
                                    <button
                                        type="button"
                                        className="button is-danger"
                                        onClick={onClearCrop}
                                    >
                                        ✖️ Clear Crop
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* API Configuration Inputs */}
                        {(captureMode === 'api' || captureMode === 'custom') && (
                            <div className="field is-grouped">
                                <div className="control is-expanded">
                                    <input
                                        className="input"
                                        type="password"
                                        placeholder="API Key"
                                        value={apiKey}
                                        onChange={(e) => onSetApiKey(e.target.value)}
                                    />
                                </div>

                                {captureMode === 'custom' && (
                                    <div className="control is-expanded">
                                        <input
                                            className="input"
                                            type="password"
                                            placeholder="API URL"
                                            value={apiUrl}
                                            onChange={(e) => onSetApiUrl(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {imageCrop && (
                            <div className="notification is-info" style={{ marginTop: '0.75rem' }}>
                                <p>
                                    <strong>✂️ Crop Active:</strong> {imageCrop.width} × {imageCrop.height}{' '}
                                    at ({imageCrop.x}, {imageCrop.y})
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};
