import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useState } from 'react';
import WebcamSelector from './components/webcam/WebcamSelector';
import { VideoDevice } from './types/webcam';

function CardEyeMate() {
  const [selectedCamera, setSelectedCamera] = useState<VideoDevice | null>(
    null,
  );
  return (
    <section className="section">
      <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h4 className="title is-4">📹 Card Eye Mate</h4>
        <WebcamSelector
          selectedCamera={selectedCamera}
          onCameraChange={setSelectedCamera}
        />
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
