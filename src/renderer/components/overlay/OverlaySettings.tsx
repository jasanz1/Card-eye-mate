import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOverlayServer } from '../../hooks/useOverlayServer';
import { OverlayPosition, OverlayConfig } from '../../types/overlay';

interface OverlaySettingsProps {
    embedded?: boolean;
}

export const OverlaySettings: React.FC<OverlaySettingsProps> = ({ embedded = false }) => {
    const navigate = useNavigate();
    const {
        serverStatus,
        isStarting,
        error,
        startServer,
        stopServer,
        updateCardData,
        updateConfig,
        refreshStatus,
    } = useOverlayServer();

    const [port, setPort] = useState(() => {
        const saved = localStorage.getItem('overlayPort');
        return saved ? Number(saved) : 3030;
    });
    const [autostart, setAutostart] = useState(() => {
        return localStorage.getItem('overlayAutostart') === 'true';
    });
    const [mockName, setMockName] = useState('Black Lotus');
    const [mockPrice, setMockPrice] = useState('$25,000');
    const [mockSet, setMockSet] = useState('Alpha');
    const [mockRarity, setMockRarity] = useState('Rare');

    const [position, setPosition] = useState<OverlayPosition>({
        x: 50,
        y: 50,
        anchor: 'top-left',
    });

    const [customCss, setCustomCss] = useState('');

    useEffect(() => {
        refreshStatus();
        const interval = setInterval(refreshStatus, 2000); // Poll status every 2 seconds
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStartServer = () => {
        startServer(port);
    };

    const handleStopServer = () => {
        stopServer();
    };

    const handleUpdateData = () => {
        updateCardData({
            name: mockName,
            price: mockPrice,
            set: mockSet,
            rarity: mockRarity,
        });
    };

    const handleUpdateConfig = () => {
        updateConfig({
            mode: 'overlay-only', // This is just for the type, server handles both
            position,
            customCss,
            port,
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    const content = (
        <div className="glass-card mb-5">
            <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
                <div className="is-flex is-align-items-center">
                    <h4 className="title is-4 mb-0 mr-3">🎥 Streaming Overlay</h4>
                    {serverStatus?.running ? (
                        <span className="tag is-success is-light is-medium">
                            <span style={{ marginRight: '6px', fontSize: '1.2em' }}>●</span> Running
                        </span>
                    ) : (
                        <span className="tag is-danger is-light is-medium">
                            <span style={{ marginRight: '6px', fontSize: '1.2em' }}>○</span> Stopped
                        </span>
                    )}
                </div>
                {!embedded && (
                    <button
                        className="button is-ghost"
                        onClick={() => navigate('/')}
                    >
                        ← Back to Camera
                    </button>
                )}
            </div>

            {/* Server Control */}
            <div className="card-section">
                <h5 className="title is-5 mb-3">Server Control</h5>
                <div className="field is-grouped is-align-items-flex-end">
                    <div className="control">
                        <label className="label">Port</label>
                        <input
                            className="input"
                            type="number"
                            value={port}
                            onChange={(e) => {
                                const newPort = Number(e.target.value);
                                setPort(newPort);
                                localStorage.setItem('overlayPort', String(newPort));
                            }}
                            disabled={serverStatus?.running}
                            style={{ width: '100px' }}
                        />
                    </div>
                    <div className="control">
                        {!serverStatus?.running ? (
                            <button
                                className={`button is-success ${isStarting ? 'is-loading' : ''}`}
                                onClick={handleStartServer}
                                disabled={isStarting}
                            >
                                Start Server
                            </button>
                        ) : (
                            <button
                                className={`button is-danger ${isStarting ? 'is-loading' : ''}`}
                                onClick={handleStopServer}
                                disabled={isStarting}
                            >
                                Stop Server
                            </button>
                        )}
                    </div>
                </div>

                <div className="field mt-3">
                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={autostart}
                            onChange={(e) => {
                                setAutostart(e.target.checked);
                                localStorage.setItem('overlayAutostart', String(e.target.checked));
                            }}
                            className="mr-2"
                        />
                        Autostart server on app launch
                    </label>
                </div>

                {error && (
                    <div className="notification is-danger mt-3 is-light">
                        {error}
                    </div>
                )}

                {serverStatus?.running && (
                    <div className="mt-4">
                        <label className="label mt-3">Browser Source URLs:</label>

                        <div className="field has-addons mb-2">
                            <div className="control is-expanded">
                                <div className="button is-static is-fullwidth is-justify-content-start" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ fontWeight: 'bold', marginRight: '8px' }}>Overlay Only:</span>
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{serverStatus.urls.overlay}</span>
                                </div>
                            </div>
                            <div className="control">
                                <button
                                    className="button is-info"
                                    onClick={() => copyToClipboard(serverStatus.urls.overlay)}
                                    title="Copy URL"
                                >
                                    📋
                                </button>
                            </div>
                        </div>
                        <p className="help mb-3">Use this for a standalone overlay layer on top of your existing scenes.</p>

                        <div className="field has-addons">
                            <div className="control is-expanded">
                                <div className="button is-static is-fullwidth is-justify-content-start" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ fontWeight: 'bold', marginRight: '8px' }}>Webcam + Overlay:</span>
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{serverStatus.urls.webcamOverlay}</span>
                                </div>
                            </div>
                            <div className="control">
                                <button
                                    className="button is-info"
                                    onClick={() => copyToClipboard(serverStatus.urls.webcamOverlay)}
                                    title="Copy URL"
                                >
                                    📋
                                </button>
                            </div>
                        </div>
                        <p className="help">Use this to get both the webcam feed and overlay in a single source.</p>
                    </div>
                )}
            </div>

            {/* Mock Data */}
            <div className="card-section">
                <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
                    <h5 className="title is-5 mb-0">Card Data Preview</h5>
                    <button
                        className="button is-primary is-small"
                        onClick={handleUpdateData}
                        disabled={!serverStatus?.running}
                    >
                        Push Updates
                    </button>
                </div>

                <div className="columns is-multiline">
                    <div className="column is-6">
                        <div className="field">
                            <label className="label">Card Name</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    value={mockName}
                                    onChange={(e) => setMockName(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="column is-6">
                        <div className="field">
                            <label className="label">Price</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    value={mockPrice}
                                    onChange={(e) => setMockPrice(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="column is-6">
                        <div className="field">
                            <label className="label">Set</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    value={mockSet}
                                    onChange={(e) => setMockSet(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="column is-6">
                        <div className="field">
                            <label className="label">Rarity</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    value={mockRarity}
                                    onChange={(e) => setMockRarity(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Configuration */}
            <div className="card-section">
                <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
                    <h5 className="title is-5 mb-0">Overlay Configuration</h5>
                    <button
                        className="button is-info is-small"
                        onClick={handleUpdateConfig}
                        disabled={!serverStatus?.running}
                    >
                        Update Config
                    </button>
                </div>

                <div className="columns">
                    <div className="column is-6">
                        <label className="label">Position Anchor</label>
                        <div className="field has-addons">
                            {['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'].map((anchor) => (
                                <p className="control" key={anchor}>
                                    <button
                                        className={`button is-small ${position.anchor === anchor ? 'is-selected' : ''}`}
                                        onClick={() => setPosition({ ...position, anchor: anchor as any })}
                                    >
                                        {anchor.replace('-', ' ')}
                                    </button>
                                </p>
                            ))}
                        </div>

                        <div className="columns mt-2">
                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">Offset X (px)</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="number"
                                            value={position.x}
                                            onChange={(e) => setPosition({ ...position, x: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">Offset Y (px)</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="number"
                                            value={position.y}
                                            onChange={(e) => setPosition({ ...position, y: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="column is-6">
                        <div className="field">
                            <label className="label">Custom CSS</label>
                            <div className="control">
                                <textarea
                                    className="textarea input"
                                    placeholder=".card-overlay { background: red; }"
                                    value={customCss}
                                    onChange={(e) => setCustomCss(e.target.value)}
                                    rows={6}
                                    style={{ minHeight: '120px' }}
                                />
                            </div>
                            <p className="help">Target classes like .card-overlay, .card-name, .card-price</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (embedded) {
        return <div className="mt-5 fade-in">{content}</div>;
    }

    return (
        <section className="section">
            <div className="container">
                {content}
            </div>
        </section>
    );
};
