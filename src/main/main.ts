/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain, globalShortcut } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('register-global-shortcut', async (event, key) => {
  try {
    // Unregister any existing shortcut first
    globalShortcut.unregisterAll();

    // Register the new shortcut
    const ret = globalShortcut.register(key, () => {
      if (mainWindow) {
        mainWindow.webContents.send('trigger-capture');
      }
    });

    if (!ret) {
      console.error('Global shortcut registration failed');
    } else {
      console.log('Global shortcut registered:', key);
    }
  } catch (error) {
    console.error('Error registering global shortcut:', error);
  }
});

ipcMain.on('unregister-global-shortcut', async () => {
  globalShortcut.unregisterAll();
  console.log('Global shortcuts unregistered');
});

ipcMain.on('save-image', async (event, dataUrl) => {
  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches.length !== 3) {
      throw new Error('Invalid input string');
    }

    const buffer = Buffer.from(matches[2], 'base64');
    const capturesDir = path.join(__dirname, '../../captures');

    if (!fs.existsSync(capturesDir)) {
      fs.mkdirSync(capturesDir, { recursive: true });
    }

    const filename = `capture-${Date.now()}.png`;
    const filePath = path.join(capturesDir, filename);

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error('Failed to save image:', err);
      } else {
        console.log('Image saved successfully:', filePath);
      }
    });
  } catch (error) {
    console.error('Error saving image:', error);
  }
});

ipcMain.on('process-image', async (event, { dataUrl, apiKey }) => {
  try {
    // In a real app, this would send the image to an API
    console.log(`Processing image via API with Key: ${apiKey ? '***' : 'Missing'}...`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Image processed successfully');

    // You could send a response back to the renderer if needed
    // event.reply('process-image-complete', { success: true });
  } catch (error) {
    console.error('Error processing image:', error);
  }
});

ipcMain.on('custom-process-image', async (event, { dataUrl, apiKey, apiUrl }) => {
  try {
    // Placeholder for custom processing logic
    console.log(`Processing via Custom Processor at ${apiUrl} with Key: ${apiKey ? '***' : 'Missing'}...`);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('Custom image processed successfully');
  } catch (error) {
    console.error('Error in custom processing:', error);
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Unregister all shortcuts when app is closing
  globalShortcut.unregisterAll();

  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
