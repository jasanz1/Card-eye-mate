import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { Server as WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import path from 'path';
import fs from 'fs';

interface CardData {
  name: string;
  price: string;
  set?: string;
  rarity?: string;
  timestamp?: number;
}

interface OverlayConfig {
  position: {
    x: number;
    y: number;
    anchor: string;
  };
  customCss: string;
  deviceId?: string;
}

export class OverlayServer {
  private app: Application;
  private server: HTTPServer | null = null;
  private wss: WebSocketServer | null = null;
  private port: number;
  private isRunning: boolean = false;
  private cardData: CardData = {
    name: 'Black Lotus',
    price: '$25,000',
    set: 'Alpha',
    rarity: 'Rare',
  };
  private config: OverlayConfig = {
    position: { x: 50, y: 50, anchor: 'top-left' },
    customCss: '',
  };

  constructor(port: number = 3030) {
    this.port = port;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Overlay-only route
    this.app.get('/overlay', (req: Request, res: Response) => {
      const html = this.generateOverlayHTML(false);
      res.send(html);
    });

    // Webcam + Overlay route
    this.app.get('/overlay-webcam', (req: Request, res: Response) => {
      const html = this.generateOverlayHTML(true);
      res.send(html);
    });

    // API endpoint to get current card data
    this.app.get('/api/card-data', (req: Request, res: Response) => {
      res.json(this.cardData);
    });

    // API endpoint to get current config
    this.app.get('/api/config', (req: Request, res: Response) => {
      res.json(this.config);
    });
  }

  private generateOverlayHTML(includeWebcam: boolean): string {
    const webcamScript = includeWebcam
      ? `
    // Setup vide feed
    const img = document.getElementById('webcam-feed');
    
    // The websocket onmessage will handle 'video-frame' type to update the image source
    `
      : '';

    const webcamHTML = includeWebcam
      ? '<img id="webcam-feed" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" />'
      : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Card Overlay</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      ${includeWebcam ? 'background: #000;' : 'background: transparent;'}
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    #webcam {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    /* Ensure image is behind overlay */
    #webcam-feed {
       z-index: 1;
    }

    #overlay-container {
      position: absolute;
      z-index: 10;
      transition: all 0.3s ease;
    }

    #overlay-container.top-left {
      top: var(--overlay-y, 50px);
      left: var(--overlay-x, 50px);
    }

    #overlay-container.top-right {
      top: var(--overlay-y, 50px);
      right: var(--overlay-x, 50px);
    }

    #overlay-container.bottom-left {
      bottom: var(--overlay-y, 50px);
      left: var(--overlay-x, 50px);
    }

    #overlay-container.bottom-right {
      bottom: var(--overlay-y, 50px);
      right: var(--overlay-x, 50px);
    }

    #overlay-container.center {
      top: 50%;
      left: 50%;
      transform: translate(calc(-50% + var(--overlay-x, 0px)), calc(-50% + var(--overlay-y, 0px)));
    }

    .card-overlay {
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 24px 32px;
      min-width: 300px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card-name {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .card-price {
      font-size: 36px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12px;
    }

    .card-details {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }

    .card-detail {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .card-detail-label {
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
    }

    /* Custom CSS injection point */
    {{CUSTOM_CSS}}
  </style>
</head>
<body>
  ${webcamHTML}
  <div id="overlay-container" class="top-left">
    <div class="card-overlay">
      <div class="card-name" id="card-name">Loading...</div>
      <div class="card-price" id="card-price">$0.00</div>
      <div class="card-details">
        <div class="card-detail">
          <span class="card-detail-label">Set:</span>
          <span id="card-set">-</span>
        </div>
        <div class="card-detail">
          <span class="card-detail-label">Rarity:</span>
          <span id="card-rarity">-</span>
        </div>
      </div>
    </div>
  </div>

  <script>
    ${webcamScript}

    // WebSocket connection for real-time updates
    const ws = new WebSocket('ws://' + window.location.host);
    
    ws.onopen = () => {
      console.log('Connected to overlay server');
      // Request initial data
      fetchCardData();
      fetchConfig();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'card-data') {
        updateCardData(data.payload);
      } else if (data.type === 'config') {
        updateConfig(data.payload);
      } else if (data.type === 'video-frame') {
          const img = document.getElementById('webcam-feed');
          if (img) img.src = data.payload;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from overlay server');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    };

    async function fetchCardData() {
      try {
        const response = await fetch('/api/card-data');
        const data = await response.json();
        updateCardData(data);
      } catch (error) {
        console.error('Error fetching card data:', error);
      }
    }

    async function fetchConfig() {
      try {
        const response = await fetch('/api/config');
        const config = await response.json();
        updateConfig(config);
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    }

    function updateCardData(data) {
      document.getElementById('card-name').textContent = data.name || 'Unknown Card';
      document.getElementById('card-price').textContent = data.price || '$0.00';
      document.getElementById('card-set').textContent = data.set || '-';
      document.getElementById('card-rarity').textContent = data.rarity || '-';
    }

    function updateConfig(config) {
      const container = document.getElementById('overlay-container');
      
      // Update position
      if (config.position) {
        container.className = config.position.anchor || 'top-left';
        container.style.setProperty('--overlay-x', config.position.x + 'px');
        container.style.setProperty('--overlay-y', config.position.y + 'px');
      }
    }

    // Initial load
    fetchCardData();
    fetchConfig();
  </script>
</body>
</html>
    `.replace('{{CUSTOM_CSS}}', this.config.customCss);
  }

  public broadcastFrame(frameData: string): void {
    this.broadcastToClients({
      type: 'video-frame',
      payload: frameData,
    });
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        reject(new Error('Server is already running'));
        return;
      }

      this.server = this.app.listen(this.port, () => {
        this.isRunning = true;
        console.log(`Overlay server running at http://localhost:${this.port}`);

        // Setup WebSocket server
        if (this.server) {
          this.wss = new WebSocketServer({ server: this.server });

          this.wss.on('connection', (ws: WebSocket) => {
            console.log('Client connected to overlay WebSocket');

            ws.on('close', () => {
              console.log('Client disconnected from overlay WebSocket');
            });
          });
        }

        resolve();
      });

      this.server.on('error', (error: Error) => {
        this.isRunning = false;
        reject(error);
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isRunning || !this.server) {
        resolve();
        return;
      }

      // Close WebSocket server first
      if (this.wss) {
        this.wss.close(() => {
          console.log('WebSocket server closed');
        });
      }

      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.isRunning = false;
          this.server = null;
          this.wss = null;
          console.log('Overlay server stopped');
          resolve();
        }
      });
    });
  }

  public updateCardData(data: Partial<CardData>): void {
    this.cardData = { ...this.cardData, ...data, timestamp: Date.now() };
    this.broadcastToClients({
      type: 'card-data',
      payload: this.cardData,
    });
  }

  public updateConfig(config: Partial<OverlayConfig>): void {
    this.config = { ...this.config, ...config };
    this.broadcastToClients({
      type: 'config',
      payload: this.config,
    });
  }

  private broadcastToClients(message: any): void {
    if (!this.wss) return;

    const messageStr = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  public getStatus() {
    return {
      running: this.isRunning,
      port: this.port,
      urls: {
        overlay: `http://localhost:${this.port}/overlay`,
        webcamOverlay: `http://localhost:${this.port}/overlay-webcam`,
      },
    };
  }

  public isServerRunning(): boolean {
    return this.isRunning;
  }
}
