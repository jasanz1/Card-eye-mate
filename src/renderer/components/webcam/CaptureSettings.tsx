import React from 'react';
import { ImageCrop } from '../../types/webcam';

type Props = {
    captureKey: string;
    isRecordingKey: boolean;
    onSetRecordingKey: (value: boolean) => void;
    imageCrop: ImageCrop | null;
    onClearCrop: () => void;
};

export const CaptureSettings: React.FC<Props> = ({
    captureKey,
    isRecordingKey,
    onSetRecordingKey,
    imageCrop,
    onClearCrop,
}) => {
    return (
        <>
            {/* Capture Settings Row */}
            <div className="field is-grouped is-align-items-center">
                <div className="control">
                    <button
                        type="button"
                        className={`button ${isRecordingKey ? 'is-warning' : 'is-primary'}`}
                        onClick={() => onSetRecordingKey(true)}
                    >
                        {isRecordingKey ? 'Press any key...' : `Capture Key: ${captureKey}`}
                    </button>
                </div>
                <div className="control">
                    <p className="help">Press the key to take a snapshot.</p>
                </div>
                {imageCrop && (
                    <div className="control">
                        <button
                            type="button"
                            className="button is-danger"
                            onClick={onClearCrop}
                        >
                            Clear Crop
                        </button>
                    </div>
                )}
            </div>

            {imageCrop && (
                <div className="notification is-info">
                    <p>
                        <strong>Crop Active:</strong> {imageCrop.width} x {imageCrop.height}{' '}
                        at ({imageCrop.x}, {imageCrop.y})
                    </p>
                </div>
            )}
        </>
    );
};
