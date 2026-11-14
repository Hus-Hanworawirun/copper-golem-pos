const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;

// Configure Auto-Updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function setupAutoUpdater() {
  // Only check for updates when packaged as an executable
  if (!app.isPackaged) return;

  autoUpdater.on('update-available', (info) => {
    console.log('Update found:', info.version);
  });

  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'อัปเดตเวอร์ชันใหม่สำเร็จ',
      message: `ดาวน์โหลดเวอร์ชัน ${info.version} เรียบร้อยแล้ว`,
      detail: 'คุณต้องการรีสตาร์ตโปรแกรมเพื่อติดตั้งเวอร์ชันใหม่ทันทีหรือไม่?',
      buttons: ['รีสตาร์ตทันที', 'ไว้ภายหลัง'],
      defaultId: 0,
      cancelId: 1
    }).then((res) => {
      if (res.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    console.warn('AutoUpdater notice:', err.message);
  });

  // Check for updates 3 seconds after application startup
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.warn('Check for updates skipped:', err.message);
    });
  }, 3000);
}

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
    title: 'Pouch',
    icon: path.join(__dirname, 'build', 'icon.ico'),
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
  setTimeout(() => {
    createWindow();
    setupAutoUpdater();
  }, 600);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
