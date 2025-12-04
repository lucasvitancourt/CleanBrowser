const { app, BrowserWindow, ipcMain, session, dialog, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

class BrowserApp {
  constructor() {
    this.windows = new Set();
    this.downloads = new Map();
    this.init();
  }

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

    app.on('browser-window-created', (_, window) => {
      this.setupWindow(window);
    });
  }

  createWindow() {
    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      frame: false,
      titleBarStyle: 'hidden',
      backgroundColor: '#f5f5f7',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webviewTag: true
      }
    });

    win.loadFile('index.html');
    this.windows.add(win);

    win.on('closed', () => {
      this.windows.delete(win);
    });

    return win;
  }

  setupWindow(window) {
    // Configurar eventos da janela
    ipcMain.on('window-control', (event, action) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) return;

      switch (action) {
        case 'close':
          win.close();
          break;
        case 'minimize':
          win.minimize();
          break;
        case 'maximize':
          if (win.isMaximized()) {
            win.unmaximize();
          } else {
            win.maximize();
          }
          break;
        case 'fullscreen':
          win.setFullScreen(!win.isFullScreen());
          break;
      }
    });
  }

  registerShortcuts() {
    globalShortcut.register('CommandOrControl+N', () => {
      this.createWindow();
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
