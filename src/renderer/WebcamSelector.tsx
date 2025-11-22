import React, { useEffect, useRef, useState } from "react";

type VideoDevice = {
  deviceId: string;
  label: string;
  inUse: boolean;
};

type Props = {
  selectedCamera: VideoDevice | null;
  onCameraChange: (device: VideoDevice | null) => void;
};

const WebcamSelector: React.FC<Props> = ({ selectedCamera, onCameraChange }) => {
  const [devices, setDevices] = useState<VideoDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentStreamRef = useRef<MediaStream | null>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Debounce ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      }

      // If successful, mark as not in use
      if (deviceId) {
        setDevices((prev) =>
          prev.map((d) => (d.deviceId === deviceId ? { ...d, inUse: false } : d))
        );
      }
    } catch (error: any) {
      console.error("Error starting video stream:", error);

      // Set user-friendly error message
      let errorMessage = "Failed to start video stream.";
      if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage = "Camera is in use by another application.";
      } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = "Camera permission denied.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage = "Camera not found.";
      }
      setPreviewError(errorMessage);

      // If failed, mark as in use
      if (deviceId && deviceId !== selectedDeviceId) {
        setDevices((prev) =>
          prev.map((d) => (d.deviceId === deviceId ? { ...d, inUse: true } : d))
        );
      }
    }
  };

  // Robust device loading without probing (as requested)
  const refreshDevices = async (retryCount = 0) => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputDevices = allDevices.filter((d) => d.kind === "videoinput");

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
        const currentStillExists = devicesList.find(d => d.deviceId === selectedDeviceId);

        if (!currentStillExists) {
          // Prefer a device that is NOT in use
          const firstAvailable = devicesList.find(d => !d.inUse) || devicesList[0];
          setSelectedDeviceId(firstAvailable.deviceId);
          onCameraChange(firstAvailable);
        }
      } else {
        // No devices found
        if (selectedDeviceId) {
          setSelectedDeviceId("");
          onCameraChange(null);
        }
      }
    } catch (error) {
      console.error("Error refreshing devices:", error);
    }
  };

  useEffect(() => {
    refreshDevices();

    const handleDeviceChange = () => {
      // Debounce logic
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        refreshDevices();
      }, 500); // Debounce for 500ms
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      stopCurrentStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Consolidated effect for stream management
  useEffect(() => {
    if (showVideoPreview && selectedCamera) {
      startStream(selectedCamera.deviceId);
    } else {
      stopCurrentStream();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVideoPreview, selectedCamera]);

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
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
                    {device.label} {device.inUse ? "(in use)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="field is-grouped">
          <div className="control is-expanded">
            <button className="button is-info is-fullwidth" onClick={() => refreshDevices()}>
              Refresh
            </button>
          </div>
          <div className="control is-expanded">
            <button className="js-modal-trigger button is-fullwidth" onClick={toggleVideoPreview}>
              Show Preview
            </button>
          </div>
        </div>

        {/* Video preview in a Bulma modal */}
        <div className={showVideoPreview ? 'modal is-active' : 'modal'}>
          <div className="modal-background" onClick={toggleVideoPreview}></div>
          <div className="modal-content">
            <figure className="image is-16by9" style={{ position: 'relative' }}>
              {previewError ? (
                <div className="notification is-danger" style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  width: '80%',
                  textAlign: 'center'
                }}>
                  {previewError}
                </div>
              ) : null}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "4px",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </figure>
          </div>
          <button className="modal-close is-large" aria-label="close" onClick={toggleVideoPreview}></button>
        </div>
      </div>
    </section>
  );
};

export type { VideoDevice };
export default WebcamSelector;