// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'save-image'
  | 'process-image'
  | 'custom-process-image'
  | 'register-global-shortcut'
  | 'unregister-global-shortcut'
  | 'start-overlay-server'
  | 'stop-overlay-server'
  | 'update-overlay-data'
  | 'update-overlay-config'
  | 'get-overlay-status'
  | 'broadcast-video-frame';
export type ListenChannels = 'trigger-capture' | 'overlay-server-status';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels | ListenChannels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    onCapture(func: () => void) {
      const subscription = () => func();
      ipcRenderer.on('trigger-capture', subscription);
      return () => {
        ipcRenderer.removeListener('trigger-capture', subscription);
      };
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
