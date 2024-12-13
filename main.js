const { app, BrowserWindow, ipcMain, session, dialog, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

class BrowserApp {
  constructor() {
    this.windows = new Set();
    this.downloads = new Map();
    this.init();
  }

  createWindow() {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
    });

  };

  init() {
    app.whenReady().then(() => {
      this.createWindow();
      this.setupIPC();

      app.on('activate', () => {
        if (this.windows.size === 0) {
          this.createWindow();
        }
      });

      this.registerShortcuts();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    /* A função 'setupWindow' não existe, você precisa cria-lá e definir qual vai ser o comportamento dela, caso contrário você vai continuar recebendo TypeError */
    app.on('browser-window-created', (_, window) => {
      this.setupWindow(window); 
    });
  }

  registerShortcuts() {
    globalShortcut.register('CommandOrControl+N', () => {
      this.createWindow();
    });

    globalShortcut.register('CommandOrControl+Shift+N', () => {
      this.createIncognitoWindow();
    });
  }

  setupIPC() {
    ipcMain.handle('load-url', async (event, input) => {
      try {
        const cleanInput = input.trim().replace(/\s+/g, ' ');

        const isUrl = (string) => {
          try {
            new URL(string);
            return true;
          } catch {
            return false;
          }
        };

        const isDomain = (string) => {
          return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(string);
        };

        if (isUrl(cleanInput)) {
          return { success: true, url: cleanInput };
        } else if (isDomain(cleanInput)) {
          return { success: true, url: `https://${cleanInput}` };
        } else {
          const searchTerm = encodeURIComponent(cleanInput);
          return {
            success: true,
            url: `https://www.google.com/search?q=${searchTerm}`,
            isSearch: true
          };
        }
      } catch (error) {
        console.error('Erro ao processar URL:', error);
        return {
          success: false,
          url: 'https://www.google.com',
          error: error.message
        };
      }
    });
  }
}

if (process.platform === 'win32') {
  app.setAppUserModelId(app.getName());
}

app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('enable-features', 'NetworkService,NetworkServiceInProcess');
app.commandLine.appendSwitch('disable-features', 'Autofill,AutofillServerCommunication');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-hardware-overlays', 'single-fullscreen,single-on-top');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-accelerated-mjpeg-decode');
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
app.commandLine.appendSwitch('enable-gpu-memory-buffer-video-frames');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,VaapiVideoEncoder');
app.commandLine.appendSwitch('disable-features', 'UseChromeOSDirectVideoDecoder');
app.commandLine.appendSwitch('enable-high-resolution-scrolling');
app.commandLine.appendSwitch('enable-smooth-scrolling');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');

new BrowserApp();

app.on('browser-window-created', (_, window) => {
  window.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      window.webContents.toggleDevTools();
      event.preventDefault();
    }
  });
});
