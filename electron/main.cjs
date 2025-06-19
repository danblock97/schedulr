const {
	app,
	BrowserWindow,
	ipcMain,
	shell,
	globalShortcut,
	Tray,
	Menu,
} = require("electron");
const path = require("node:path");
const { autoUpdater } = require("electron-updater");
const isDev = require("electron-is-dev");

let mainWindow;
let installerWindow;
const MIN_SPLASH_TIME = 3000; // ms
let splashShownAt = 0;
let pendingAuthTokens = null;
const deeplinkScheme = "schedulr";
let tray = null;
const startHidden = process.argv.includes("--hidden");

function createInstallerWindow() {
	installerWindow = new BrowserWindow({
		width: 450,
		height: 600,
		resizable: false,
		show: false,
		frame: false,
		backgroundColor: "#00000000",
		transparent: true,
		icon: path.join(__dirname, "../public/images/logo-light.png"),
		webPreferences: {
			preload: path.join(__dirname, "preload.cjs"),
			contextIsolation: true,
		},
	});

	installerWindow.loadFile(path.join(__dirname, "installer.html"));
	installerWindow.once("ready-to-show", () => installerWindow.show());
	splashShownAt = Date.now();
}

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: 1920,
		height: 1080,
		minWidth: 1280,
		minHeight: 720,
		frame: false,
		show: false,
		backgroundColor: "#000000",
		icon: path.join(__dirname, "../public/images/logo.ico"),
		webPreferences: {
			preload: path.join(__dirname, "preload.cjs"),
			contextIsolation: true,
		},
	});

	if (isDev) {
		mainWindow.loadURL("http://localhost:8080");
		mainWindow.webContents.openDevTools({ mode: "detach" });
	} else {
		mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
	}

	mainWindow.once("ready-to-show", () => {
		if (!startHidden) {
			mainWindow.show();
		}
		if (pendingAuthTokens) {
			mainWindow.webContents.send("supabase-login", pendingAuthTokens);
			pendingAuthTokens = null;
		}
		if (installerWindow) {
			installerWindow.close();
			installerWindow = null;
		}
		createTray();
	});

	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url);
		return { action: "deny" };
	});
}

function showMainWindowWhenReady() {
	const diff = Date.now() - splashShownAt;
	if (diff >= MIN_SPLASH_TIME) {
		createMainWindow();
	} else {
		setTimeout(createMainWindow, MIN_SPLASH_TIME - diff);
	}
}

app.whenReady().then(() => {
	createInstallerWindow();

	if (isDev) {
		showMainWindowWhenReady();
	} else {
		autoUpdater.autoDownload = true;
		autoUpdater.checkForUpdates();
	}

	// Register global shortcut for Quick Add once the app is ready
	const shortcut =
		process.platform === "darwin"
			? "Command+Shift+Space"
			: "Control+Shift+Space";
	globalShortcut.register(shortcut, () => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.show();
			mainWindow.focus();
			mainWindow.webContents.send("global-quick-add");
		}
	});
});

autoUpdater.on("checking-for-update", () => {
	installerWindow?.webContents.send("update-status", "checking");
});

autoUpdater.on("update-available", () => {
	installerWindow?.webContents.send("update-status", "update-available");
});

autoUpdater.on("download-progress", () => {
	installerWindow?.webContents.send("update-status", "downloading");
});

autoUpdater.on("update-downloaded", () => {
	installerWindow?.webContents.send("update-status", "update-downloaded");
	if (mainWindow) {
		mainWindow.webContents.send("update-status", "update-downloaded");
	}
});

autoUpdater.on("update-not-available", () => {
	installerWindow?.webContents.send("update-status", "up-to-date");
	showMainWindowWhenReady();
});

autoUpdater.on("error", (err) => {
	console.error(err);
	installerWindow?.webContents.send("update-status", "error");
	showMainWindowWhenReady();
});

ipcMain.on("open-external", (_event, url) => {
	shell.openExternal(url);
});

ipcMain.on("window-action", (event, action) => {
	const win = BrowserWindow.fromWebContents(event.sender);
	if (!win) return;
	switch (action) {
		case "minimize":
			win.minimize();
			break;
		case "maximize":
			if (win.isMaximized()) {
				win.unmaximize();
			} else {
				win.maximize();
			}
			break;
		case "close":
			win.close();
			break;
		case "hide":
			win.hide();
			break;
	}
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow();
	}
});

function handleAuthUrl(deepLink) {
	try {
		const parsed = new URL(deepLink);
		if (parsed.protocol.replace(":", "") !== deeplinkScheme) return;
		const params = parsed.searchParams;
		const access = params.get("access_token");
		const refresh = params.get("refresh_token");
		if (access && refresh) {
			pendingAuthTokens = { access, refresh };
			if (mainWindow) {
				mainWindow.webContents.send("supabase-login", pendingAuthTokens);
				pendingAuthTokens = null;
			}
		}
	} catch (err) {
		console.error("Failed to handle auth url", err);
	}
}

// ensure single instance and protocol client
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

if (isDev) {
	app.setAsDefaultProtocolClient(deeplinkScheme, process.execPath, [
		path.resolve(process.argv[1]),
	]);
} else {
	app.setAsDefaultProtocolClient(deeplinkScheme);
}

app.on("second-instance", (event, argv) => {
	const link = argv.find((a) => a.startsWith("schedulr://"));
	if (link) handleAuthUrl(link);
	if (mainWindow) {
		if (mainWindow.isMinimized()) mainWindow.restore();
		mainWindow.focus();
	}
});

app.on("open-url", (event, url) => {
	event.preventDefault();
	handleAuthUrl(url);
});

app.on("will-quit", () => {
	globalShortcut.unregisterAll();
});

function createTray() {
	if (tray) return;
	const iconPath = path.join(__dirname, "../public/images/logo-light.png");
	tray = new Tray(iconPath);
	const context = Menu.buildFromTemplate([
		{
			label: "Show Schedulr",
			click: () => {
				if (mainWindow) {
					mainWindow.show();
				}
			},
		},
		{
			label: "Quit",
			click: () => {
				app.quit();
			},
		},
	]);
	tray.setToolTip("Schedulr");
	tray.setContextMenu(context);
	// Left click (single) to show the window
	tray.on("click", () => {
		if (mainWindow) {
			mainWindow.show();
			mainWindow.focus();
		}
	});
	// Double-click as fallback
	tray.on("double-click", () => {
		if (mainWindow) {
			mainWindow.show();
			mainWindow.focus();
		}
	});
}

ipcMain.handle("set-startup", (_e, { enabled, hidden }) => {
	const settings = {
		openAtLogin: !!enabled,
	};
	if (process.platform === "darwin") {
		settings.openAsHidden = !!hidden;
	} else {
		settings.args = hidden ? ["--hidden"] : [];
	}
	app.setLoginItemSettings(settings);
	return app.getLoginItemSettings();
});

ipcMain.handle("get-startup", () => {
	const s = app.getLoginItemSettings();
	return {
		enabled: s.openAtLogin,
		hidden: s.args ? s.args.includes("--hidden") : s.openAsHidden,
	};
});

ipcMain.handle("install-update", () => {
	autoUpdater.quitAndInstall();
});
