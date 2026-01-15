import { ImageCrop, CaptureMode } from '../../types/webcam';

type Props = {
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

export const CaptureSettings: React.FC<Props> = ({
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
    return (
        <>
            {/* Combined Capture Settings */}
            <div className="card-section">
                <label className="label">Capture Settings</label>

                {/* Capture Key + Mode Selection on Same Row */}
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
            </div>

            {imageCrop && (
                <div className="notification is-info">
                    <p>
                        <strong>✂️ Crop Active:</strong> {imageCrop.width} × {imageCrop.height}{' '}
                        at ({imageCrop.x}, {imageCrop.y})
                    </p>
                </div>
            )}
        </>
    );
};
