import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useState } from 'react';
import WebcamSelector, { VideoDevice } from './WebcamSelector';

function CardEyeMate() {
  const [selectedCamera, setSelectedCamera] = useState<VideoDevice | null>(
    null,
  );
  return (
    <section className="section">
      <h4 className=""> Video </h4>
      <WebcamSelector
        selectedCamera={selectedCamera}
        onCameraChange={setSelectedCamera}
      />
      <p> currently selected camera: {selectedCamera?.label}</p>
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
