import React from 'react';
import { VideoDevice } from '../../types/webcam';

type Props = {
    devices: VideoDevice[];
    selectedDeviceId: string;
    onSelectChange: (deviceId: string) => void;
    onRefresh: () => void;
    onShowPreview: () => void;
    onEditCrop: () => void;
    isCropMode: boolean;
};

export const CameraControls: React.FC<Props> = ({
    devices,
    selectedDeviceId,
    onSelectChange,
    onRefresh,
    onShowPreview,
    onEditCrop,
    isCropMode,
}) => {
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
            </div>

            {/* Buttons Row */}
            <div className="card-section">
                <div className="field is-grouped">
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
                </div>
            </div>
        </>
    );
};
