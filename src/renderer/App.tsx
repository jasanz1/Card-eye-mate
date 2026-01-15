import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useState, useEffect } from 'react';
import WebcamSelector from './components/webcam/WebcamSelector';
import { VideoDevice } from './types/webcam';
import { OverlaySettings } from './components/overlay/OverlaySettings';
import { useOverlayServer } from './hooks/useOverlayServer';

function CardEyeMate() {
  const [selectedCamera, setSelectedCamera] = useState<VideoDevice | null>(null);
  const { startServer } = useOverlayServer();

  useEffect(() => {
    const shouldAutostart = localStorage.getItem('overlayAutostart') === 'true';
    if (shouldAutostart) {
      const port = Number(localStorage.getItem('overlayPort') || '3030');
      startServer(port);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="section">
      <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
          <h4 className="title is-4 mb-0">📹 Card Eye Mate</h4>
        </div>
        <WebcamSelector
          selectedCamera={selectedCamera}
          onCameraChange={setSelectedCamera}
        />
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <OverlaySettings embedded />
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CardEyeMate />} />
      </Routes>
    </Router>
  );
}
