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
            {/* Capture Key & Crop Settings */}
            <div className="card-section">
                <label className="label">Capture Settings</label>
                <div className="field is-grouped is-align-items-center">
                    <div className="control">
                        <button
                            type="button"
                            className={`button ${isRecordingKey ? 'is-warning' : 'is-primary'}`}
                            onClick={() => onSetRecordingKey(true)}
                        >
                            {isRecordingKey ? '⌨️ Press any key...' : `⌨️ Capture Key: ${captureKey}`}
                        </button>
                    </div>
                    <div className="control">
                        <p className="help">Press the key to take a snapshot.</p>
                    </div>

                    {imageCrop && (
                        <div className="control ml-4">
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
            </div>

            {/* Capture Mode & API Settings */}
            <div className="card-section">
                <label className="label">Capture Mode</label>
                <div className="field is-grouped is-align-items-center" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div className="control">
                        <div className="field has-addons">
                            <div className="control">
                                <button
                                    type="button"
                                    className={`button ${captureMode === 'local' ? 'is-selected is-info' : ''}`}
                                    onClick={() => onSetCaptureMode('local')}
                                >
                                    💾 Local Save
                                </button>
                            </div>
                            <div className="control">
                                <button
                                    type="button"
                                    className={`button ${captureMode === 'api' ? 'is-selected is-info' : ''}`}
                                    onClick={() => onSetCaptureMode('api')}
                                >
                                    🔗 Card Eye Mate
                                </button>
                            </div>
                            <div className="control">
                                <button
                                    type="button"
                                    className={`button ${captureMode === 'custom' ? 'is-selected is-info' : ''}`}
                                    onClick={() => onSetCaptureMode('custom')}
                                >
                                    ⚙️ Custom Processor
                                </button>
                            </div>
                        </div>
                    </div>

                    {(captureMode === 'api' || captureMode === 'custom') && (
                        <div className="control" style={{ flexGrow: 1, maxWidth: '200px' }}>
                            <input
                                className="input"
                                type="password"
                                placeholder="API Key"
                                value={apiKey}
                                onChange={(e) => onSetApiKey(e.target.value)}
                            />
                        </div>
                    )}

                    {captureMode === 'custom' && (
                        <div className="control" style={{ flexGrow: 1, maxWidth: '250px' }}>
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
