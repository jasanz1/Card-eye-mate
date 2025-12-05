import React from 'react';

type Props = {
    cropStart: { x: number; y: number } | null;
    cropCurrent: { x: number; y: number } | null;
};

export const CropOverlay: React.FC<Props> = ({ cropStart, cropCurrent }) => {
    if (!cropStart || !cropCurrent) return null;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${Math.min(cropStart.x, cropCurrent.x)}px`,
                top: `${Math.min(cropStart.y, cropCurrent.y)}px`,
                width: `${Math.abs(cropCurrent.x - cropStart.x)}px`,
                height: `${Math.abs(cropCurrent.y - cropStart.y)}px`,
                border: '2px solid #00d1b2',
                backgroundColor: 'rgba(0, 209, 178, 0.2)',
                pointerEvents: 'none',
                zIndex: 5,
            }}
        />
    );
};
