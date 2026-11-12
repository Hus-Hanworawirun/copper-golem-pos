const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

// Boot Express backend server within the Electron process
try {
  require(path.join(__dirname, 'server', 'index.js'));
} catch (e) {
  console.error('Failed to start internal backend server:', e);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'POS & Stock Pro',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the running internal express server
  mainWindow.loadURL('http://localhost:5001');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Give internal server 600ms to bind port 5001
  setTimeout(createWindow, 600);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
