import React from 'react';
import { CropOverlay } from './CropOverlay';

type Props = {
    show: boolean;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    previewError: string | null;
    isCropMode: boolean;
    cropStart: { x: number; y: number } | null;
    cropCurrent: { x: number; y: number } | null;
    onClose: () => void;
    onSaveCrop: () => void;
    onCancelCrop: () => void;
    onMouseDown: (e: React.MouseEvent<HTMLVideoElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLVideoElement>) => void;
    onMouseUp: () => void;
};

export const VideoPreviewModal: React.FC<Props> = ({
    show,
    videoRef,
    previewError,
    isCropMode,
    cropStart,
    cropCurrent,
    onClose,
    onSaveCrop,
    onCancelCrop,
    onMouseDown,
    onMouseMove,
    onMouseUp,
}) => {
    return (
        <div className={show ? 'modal is-active' : 'modal'}>
            <div
                className="modal-background"
                onClick={onClose}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Escape' && onClose()}
            />
            <div className="modal-content">
                <figure className="image is-16by9" style={{ position: 'relative' }}>
                    {previewError ? (
                        <div
                            className="notification is-danger"
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 10,
                                width: '80%',
                                textAlign: 'center',
                            }}
                        >
                            {previewError}
                        </div>
                    ) : null}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            cursor: isCropMode ? 'crosshair' : 'default',
                        }}
                    />
                    {isCropMode && <CropOverlay cropStart={cropStart} cropCurrent={cropCurrent} />}
                </figure>
            </div>
            {isCropMode && (
                <div
                    className="modal-card"
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 20,
                    }}
                >
                    <footer
                        className="modal-card-foot"
                        style={{ justifyContent: 'center' }}
                    >
                        <button
                            type="button"
                            className="button is-success"
                            onClick={onSaveCrop}
                        >
                            Save Crop
                        </button>
                        <button type="button" className="button" onClick={onCancelCrop}>
                            Cancel
                        </button>
                    </footer>
                </div>
            )}
            <button
                type="button"
                className="modal-close is-large"
                aria-label="close"
                onClick={isCropMode ? onCancelCrop : onClose}
            />
        </div>
    );
};
