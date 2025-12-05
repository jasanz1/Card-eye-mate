import React, { useEffect, useRef, useState } from 'react';

type VideoDevice = {
  deviceId: string;
  label: string;
  inUse: boolean;
};

type ImageCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  selectedCamera: VideoDevice | null;
  onCameraChange: (device: VideoDevice | null) => void;
};

const WebcamSelector: React.FC<Props> = ({
  selectedCamera,
  onCameraChange,
}) => {
  const [devices, setDevices] = useState<VideoDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentStreamRef = useRef<MediaStream | null>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // New state for capture
  const [captureKey, setCaptureKey] = useState<string>('c');
  const [isRecordingKey, setIsRecordingKey] = useState<boolean>(false);
  const [captureStatus, setCaptureStatus] = useState<string | null>(null);
  const [imageCrop, setImageCrop] = useState<ImageCrop | null>(null);
  const [isCropMode, setIsCropMode] = useState<boolean>(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [cropCurrent, setCropCurrent] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Debounce ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to hold current crop value (fixes closure issue)
  const imageCropRef = useRef<ImageCrop | null>(null);

  const toggleVideoPreview = () => {
    setShowVideoPreview((prev) => !prev);
    setPreviewError(null); // Clear error on toggle
  };

  const stopCurrentStream = () => {
    if (!currentStreamRef.current) return;
    currentStreamRef.current.getTracks().forEach((track) => track.stop());
    currentStreamRef.current = null;
  };

  const startStream = async (deviceId?: string) => {
    setPreviewError(null); // Clear previous errors
    try {
      stopCurrentStream();

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      currentStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current
          .play()
          .catch((e) => console.error('Error playing video:', e));
      }

      // If successful, mark as not in use
      if (deviceId) {
        setDevices((prev) =>
          prev.map((d) =>
            d.deviceId === deviceId ? { ...d, inUse: false } : d,
          ),
        );
      }
    } catch (error: any) {
      console.error('Error starting video stream:', error);

      // Set user-friendly error message
      let errorMessage = 'Failed to start video stream.';
      if (
        error.name === 'NotReadableError' ||
        error.name === 'TrackStartError'
      ) {
        errorMessage = 'Camera is in use by another application.';
      } else if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        errorMessage = 'Camera permission denied.';
      } else if (
        error.name === 'NotFoundError' ||
        error.name === 'DevicesNotFoundError'
      ) {
        errorMessage = 'Camera not found.';
      }
      setPreviewError(errorMessage);

      // If failed, mark as in use
      if (deviceId && deviceId !== selectedDeviceId) {
        setDevices((prev) =>
          prev.map((d) =>
            d.deviceId === deviceId ? { ...d, inUse: true } : d,
          ),
        );
      }
    }
  };

  // Robust device loading without probing (as requested)
  const refreshDevices = async (retryCount = 0) => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputDevices = allDevices.filter(
        (d) => d.kind === 'videoinput',
      );

      // Retry logic: if no devices found and we haven't retried too many times, wait and try again
      // This helps with race conditions on startup where devices aren't ready yet
      if (videoInputDevices.length === 0 && retryCount < 2) {
        console.log(`No devices found, retrying... (${retryCount + 1}/2)`);
        setTimeout(() => refreshDevices(retryCount + 1), 500);
        return;
      }

      // Map devices directly without checking if they are in use (no probing)
      const devicesList: VideoDevice[] = videoInputDevices.map((d, index) => ({
        deviceId: d.deviceId,
        label: d.label || `Camera ${index + 1}`,
        inUse: false, // Assume available since we are not probing
      }));

      setDevices(devicesList);

      // Preserve selected device if it still exists, otherwise select first available
      if (devicesList.length > 0) {
        const currentStillExists = devicesList.find(
          (d) => d.deviceId === selectedDeviceId,
        );

        if (!currentStillExists) {
          // Prefer a device that is NOT in use
          const firstAvailable =
            devicesList.find((d) => !d.inUse) || devicesList[0];
          setSelectedDeviceId(firstAvailable.deviceId);
          onCameraChange(firstAvailable);
        }
      } else {
        // No devices found
        if (selectedDeviceId) {
          setSelectedDeviceId('');
          onCameraChange(null);
        }
      }
    } catch (error) {
      console.error('Error refreshing devices:', error);
    }
  };

  const captureImage = () => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      try {
        const canvas = document.createElement('canvas');
        const currentCrop = imageCropRef.current;
        canvas.width = currentCrop
          ? currentCrop.width
          : videoRef.current.videoWidth;
        canvas.height = currentCrop
          ? currentCrop.height
          : videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (currentCrop) {
            // Use 9-parameter drawImage: source x, y, width, height, dest x, y, width, height
            ctx.drawImage(
              videoRef.current,
              currentCrop.x,
              currentCrop.y,
              currentCrop.width,
              currentCrop.height,
              0,
              0,
              currentCrop.width,
              currentCrop.height,
            );
          } else {
            // No crop, draw entire video
            ctx.drawImage(videoRef.current, 0, 0);
          }
          const dataUrl = canvas.toDataURL('image/png');
          window.electron.ipcRenderer.sendMessage('save-image', dataUrl);
          setCaptureStatus('Captured!');
          setTimeout(() => setCaptureStatus(null), 2000);
        }
      } catch (e) {
        console.error('Error capturing image:', e);
        setCaptureStatus('Error!');
        setTimeout(() => setCaptureStatus(null), 2000);
      }
    }
  };

  const toggleCropMode = () => {
    setIsCropMode((prev) => !prev);
    if (!isCropMode) {
      setShowVideoPreview(true);
    }
    setCropStart(null);
    setCropCurrent(null);
    setIsDragging(false);
  };

  const saveCrop = () => {
    if (cropStart && cropCurrent && videoRef.current) {
      const rect = videoRef.current.getBoundingClientRect();
      const scaleX = videoRef.current.videoWidth / rect.width;
      const scaleY = videoRef.current.videoHeight / rect.height;

      const x1 = Math.min(cropStart.x, cropCurrent.x);
      const y1 = Math.min(cropStart.y, cropCurrent.y);
      const x2 = Math.max(cropStart.x, cropCurrent.x);
      const y2 = Math.max(cropStart.y, cropCurrent.y);

      const newCrop = {
        x: Math.round(x1 * scaleX),
        y: Math.round(y1 * scaleY),
        width: Math.round((x2 - x1) * scaleX),
        height: Math.round((y2 - y1) * scaleY),
      };
      setImageCrop(newCrop);
    }
    setIsCropMode(false);
    setCropStart(null);
    setCropCurrent(null);
    toggleVideoPreview();
  };

  const clearCrop = () => {
    setImageCrop(null);
  };

  const handleVideoMouseDown = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!isCropMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setCropStart(pos);
    setCropCurrent(pos);
    setIsDragging(true);
  };

  const handleVideoMouseMove = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!isCropMode || !cropStart || !isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCropCurrent({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleVideoMouseUp = () => {
    if (!isCropMode || !cropStart || !cropCurrent) return;
    setIsDragging(false);
    // Crop is set, user can now save it
  };

  // Update ref when imageCrop changes
  useEffect(() => {
    imageCropRef.current = imageCrop;
  }, [imageCrop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isRecordingKey) {
        setCaptureKey(e.key);
        setIsRecordingKey(false);
        e.preventDefault();
        return;
      }

      if (e.key === captureKey) {
        captureImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [captureKey, isRecordingKey]);

  // Register global shortcut and listen for trigger
  useEffect(() => {
    // Register the global shortcut
    window.electron.ipcRenderer.sendMessage(
      'register-global-shortcut',
      captureKey,
    );

    // Listen for capture trigger from main process
    const unsubscribe = window.electron.ipcRenderer.onCapture(() => {
      captureImage();
    });

    return () => {
      unsubscribe();
      window.electron.ipcRenderer.sendMessage('unregister-global-shortcut');
    };
  }, [captureKey]);

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

  // Consolidated effect for stream management
  useEffect(() => {
    if (selectedCamera) {
      startStream(selectedCamera.deviceId);
    } else {
      stopCurrentStream();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value;
    setSelectedDeviceId(deviceId);
    const device = devices.find((d) => d.deviceId === deviceId);
    if (device) {
      onCameraChange(device);
    }
  };

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

        {/* Camera Dropdown Row */}
        <div className="field">
          <label className="label" htmlFor="camera-select">
            Camera
          </label>
          <div className="control is-expanded">
            <div className="select is-fullwidth">
              <select
                id="camera-select"
                value={selectedDeviceId}
                onChange={handleSelectChange}
              >
                {devices.length === 0 && (
                  <option disabled>No cameras found</option>
                )}
                {devices.map((device) => (
                  <option
                    key={device.deviceId}
                    value={device.deviceId}
                    disabled={device.inUse} // Disable in-use cameras
                  >
                    {device.label} {device.inUse ? '(in use)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="field is-grouped">
          <div className="control is-expanded">
            <button
              className="button is-info is-fullwidth"
              onClick={() => refreshDevices()}
            >
              Refresh
            </button>
          </div>
          <div className="control is-expanded">
            <button
              className="js-modal-trigger button is-fullwidth"
              onClick={toggleVideoPreview}
            >
              Show Preview
            </button>
          </div>
          <div className="control is-expanded">
            <button
              className={`button is-fullwidth ${isCropMode ? 'is-warning' : 'is-link'}`}
              onClick={toggleCropMode}
            >
              {isCropMode ? 'Exit Crop Mode' : 'Edit Crop'}
            </button>
          </div>
        </div>

        {/* Capture Settings Row */}
        <div className="field is-grouped is-align-items-center">
          <div className="control">
            <button
              className={`button ${isRecordingKey ? 'is-warning' : 'is-primary'}`}
              onClick={() => setIsRecordingKey(true)}
            >
              {isRecordingKey
                ? 'Press any key...'
                : `Capture Key: ${captureKey}`}
            </button>
          </div>
          <div className="control">
            <p className="help">Press the key to take a snapshot.</p>
          </div>
          {imageCrop && (
            <div className="control">
              <button className="button is-danger" onClick={clearCrop}>
                Clear Crop
              </button>
            </div>
          )}
        </div>

        {imageCrop && (
          <div className="notification is-info">
            <p>
              <strong>Crop Active:</strong> {imageCrop.width} x{' '}
              {imageCrop.height} at ({imageCrop.x}, {imageCrop.y})
            </p>
          </div>
        )}

        {/* Video preview in a Bulma modal */}
        <div className={showVideoPreview ? 'modal is-active' : 'modal'}>
          <div className="modal-background" onClick={toggleVideoPreview} />
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
                onMouseDown={handleVideoMouseDown}
                onMouseMove={handleVideoMouseMove}
                onMouseUp={handleVideoMouseUp}
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
              {isCropMode && cropStart && cropCurrent && (
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
              )}
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
                <button className="button is-success" onClick={saveCrop}>
                  Save Crop
                </button>
                <button className="button" onClick={toggleCropMode}>
                  Cancel
                </button>
              </footer>
            </div>
          )}
          <button
            className="modal-close is-large"
            aria-label="close"
            onClick={isCropMode ? toggleCropMode : toggleVideoPreview}
          />
        </div>
      </div>
    </section>
  );
};

export type { VideoDevice };
export default WebcamSelector;
