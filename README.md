# Card Eye Mate

Card Eye Mate is a desktop application designed for trading card game collectors and streamers. It integrates with your webcam to identify cards and provides a real-time, customizable overlay that can be used in streaming software like OBS.

## Features

- **Webcam Integration**: Seamlessly connects to your local webcam to capture card images.
- **Auto-Recognition**: connect to external APIs to identify cards and retrieve pricing/rarity data.
- **Stream Overlay Server**: Built-in local web server that hosts a dynamic overlay.
  - **Overlay Only**: `http://localhost:3030/overlay` (Great for adding on top of existing camera feeds)
  - **Webcam + Overlay**: `http://localhost:3030/overlay-webcam` (Complete solution)
- **Real-time Updates**: Changes to settings or identified cards are immediately reflected on the overlay via WebSockets.
- **Customization**:
  - Adjust overlay position (Top/Bottom, Left/Right).
  - Inject custom CSS for full visual control.
  - Modern, glassmorphism-inspired UI.

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/card-eye-mate.git
    cd card-eye-mate
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

To start the application in development mode:

```bash
npm start
```

This will launch the Electron application with Hot Module Replacement (HMR) enabled.

### Building for Production

To create a distributable package for your OS:

```bash
npm run package
```

## Usage

1.  **Launch the App**: Open Card Eye Mate.
2.  **Select Webcam**: Go to settings and choose your camera source.
3.  **Configure API**: Enter your API key/URL for the card recognition service in settings.
4.  **Start Overlay**: Enable the Overlay Server in the settings menu.
5.  **Add to OBS**:
    - Add a new **Browser Source** in OBS.
    - Set the URL to `http://localhost:3030/overlay` (or `overlay-webcam`).
    - Set width/height to match your canvas (e.g., 1920x1080).

## Built With

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/) (Overlay Server)
- [WebSocket](https://www.npmjs.com/package/ws) (Real-time communication)
- [Sass](https://sass-lang.com/)

## License

MIT
