const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const { startWebSocketServer } = require('./websocket-server');

// Set persistent database path for production
if (app.isPackaged || process.env.NODE_ENV === 'production') {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'dev.db');
    process.env.DATABASE_URL = `file:${dbPath}`;

    if (app.isPackaged) {
        const logPath = path.join(userDataPath, 'startup.log');
        const log = (msg) => {
            const entry = `${new Date().toISOString()} - ${msg}\n`;
            fs.appendFileSync(logPath, entry);
            console.log(msg);
        };

        log(`📦 Database set to persistent path: ${dbPath}`);

        try {
            if (!fs.existsSync(dbPath)) {
                log(`🆕 Database file not found. Initializing from starter...`);
                // When using ASAR, we use __dirname to stay within the virtual FS
                const starterDbPath = path.join(__dirname, '..', 'prisma', 'starter.db');

                if (fs.existsSync(starterDbPath)) {
                    // Electron's fs module allows reading from ASAR
                    const data = fs.readFileSync(starterDbPath);
                    fs.writeFileSync(dbPath, data);
                    log(`✅ Database initialized from starter.db`);
                } else {
                    log(`⚠️ starter.db not found at ${starterDbPath}.`);
                }
            } else {
                log(`✅ Existing database found at ${dbPath}`);
            }
        } catch (dbError) {
            log(`❌ Failed to initialize database: ${dbError.message}`);
        }

        // Auto-update check
        autoUpdater.checkForUpdatesAndNotify();

        autoUpdater.on('update-available', () => {
            log('🚀 Update available!');
        });

        autoUpdater.on('update-downloaded', () => {
            log('✅ Update downloaded. Will install on restart.');
        });
    }
}

const next = require('next');
let nextApp;

async function startServer() {
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    const port = 3001;

    if (isDev) {
        return 'http://localhost:3000';
    }

    try {
        const appPath = path.join(__dirname, '..');
        nextApp = next({
            dev: false,
            dir: appPath,
            conf: {
                distDir: '.next'
            }
        });

        await nextApp.prepare();
        const handler = nextApp.getRequestHandler();

        const { createServer } = require('http');
        const server = createServer((req, res) => {
            handler(req, res);
        });

        return new Promise((resolve, reject) => {
            server.listen(port, (err) => {
                if (err) return reject(err);
                console.log(`🚀 Next.js server ready on http://localhost:${port}`);
                resolve(`http://localhost:${port}`);
            });

            server.on('error', (e) => {
                if (e.code === 'EADDRINUSE') {
                    console.log(`Port ${port} in use, retrying on ${port + 1}...`);
                    server.listen(port + 1);
                }
            });
        });
    } catch (err) {
        console.error('Failed to start embedded Next.js server:', err);
        throw err;
    }
}

let mainWindow;

async function createWindow() {
    const startUrl = await startServer().catch(err => {
        return `data:text/html,<html><body><h1>Erreur de démarrage</h1><p>${err.message}</p></body></html>`;
    });

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false, // Security best practice
            contextIsolation: true, // Security best practice
            preload: path.join(__dirname, 'preload.js')
        },
        title: "IDEAL GESTION - Premium Local Server"
    });

    mainWindow.loadURL(startUrl);

    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// IPC Handlers
ipcMain.handle('get-printers', async () => {
    if (!mainWindow) return [];
    try {
        return await mainWindow.webContents.getPrintersAsync();
    } catch (e) {
        console.error("Failed to get printers:", e);
        return [];
    }
});

ipcMain.handle('print-job', async (event, content, printerName) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);

        const tempFile = path.join(os.tmpdir(), `ticket-${Date.now()}.txt`);
        fs.writeFileSync(tempFile, content);

        // Escape single quotes for PowerShell
        const safePrinterName = printerName.replace(/'/g, "''");

        const cmd = `powershell -Command "Get-Content -Path '${tempFile}' | Out-Printer -Name '${safePrinterName}'"`;
        await execAsync(cmd);

        return { success: true };
    } catch (e) {
        console.error("Print job failed:", e);
        return { success: false, error: e.message };
    }
});

app.on('ready', async () => {
    await createWindow();

    // Start the local WebSocket server for other terminals
    const startWS = (port2) => {
        try {
            startWebSocketServer(port2);
            console.log(`🚀 Electron Local Server ready on port ${port2}`);
        } catch (e) {
            if (e.code === 'EADDRINUSE') {
                console.log(`WS Port ${port2} in use, trying ${port2 + 1}`);
                startWS(port2 + 1);
            } else {
                console.error('WS Error:', e);
            }
        }
    };
    startWS(4000);
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    // Re-create window if docked icon clicked and no windows open
});

// Sync events via IPC
ipcMain.on('sync-status-update', (event, arg) => {
    console.log('Sync status update from frontend:', arg);
});
