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
const windowStateKeeper = require("electron-window-state");

let mainWindow;
let installerWindow;
const MIN_SPLASH_TIME = 500; // ms
const UPDATE_CHECK_TIMEOUT = 20_000; // ms – 20 seconds
let splashShownAt = 0;
let pendingAuthTokens = null;
const deeplinkScheme = "schedulr";
let tray = null;
// Detect if the app was started with the "--hidden" flag, taking into account
// the extra arguments that Squirrel/Update.exe adds on Windows. When Windows
// launches an app at login via Update.exe, the arguments look like:
//   Update.exe --processStart "Schedulr.exe" --process-start-args "--hidden"
// which means "--hidden" is *inside* the value that follows
// "--process-start-args".  To reliably detect hidden-startup we therefore need
// to check both the direct presence of "--hidden" **and** whether it appears
// inside the process-start-args string.
const startHidden =
	process.argv.includes("--hidden") ||
	(process.argv.includes("--process-start-args") &&
		process.argv
			.slice(process.argv.indexOf("--process-start-args") + 1)
			.some((arg) => arg.includes("--hidden")));

function createInstallerWindow() {
	// Load the previous state with fallback to defaults
	const installerWindowState = windowStateKeeper({
		defaultWidth: 450,
		defaultHeight: 600,
		path: path.join(app.getPath("userData"), "window-state-installer.json"),
	});

	installerWindow = new BrowserWindow({
		width: installerWindowState.width,
		height: installerWindowState.height,
		x: installerWindowState.x,
		y: installerWindowState.y,
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

	// Let us register listeners on the window, so we can update the state
	// automatically (the listeners will be removed when the window is closed)
	installerWindowState.manage(installerWindow);

	installerWindow.loadFile(path.join(__dirname, "installer.html"));
	installerWindow.once("ready-to-show", () => installerWindow.show());
	splashShownAt = Date.now();
}

function createMainWindow() {
	// Load the previous state with fallback to defaults
	const mainWindowState = windowStateKeeper({
		defaultWidth: 1920,
		defaultHeight: 1080,
		path: path.join(app.getPath("userData"), "window-state-main.json"),
	});

	mainWindow = new BrowserWindow({
		width: mainWindowState.width,
		height: mainWindowState.height,
		x: mainWindowState.x,
		y: mainWindowState.y,
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

	// Let us register listeners on the window, so we can update the state
	// automatically (the listeners will be removed when the window is closed)
	// and restore the maximized or full screen state
	mainWindowState.manage(mainWindow);

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
	// If starting hidden, skip installer window and go straight to main window
	if (startHidden) {
		createMainWindow();
		// Still set up auto-updater for hidden startup
		if (!isDev) {
			autoUpdater.autoDownload = true;
			autoUpdater.checkForUpdates();
		}
	} else {
		createInstallerWindow();

		if (isDev) {
			showMainWindowWhenReady();
		} else {
			autoUpdater.autoDownload = true;
			autoUpdater.checkForUpdates();
		}

		// ------------------------------------------------------------------
		// Fallback: If the updater takes too long (e.g. network offline or the
		// GitHub request hangs) make sure we still present the application to the
		// user instead of leaving them on the splash screen indefinitely.
		// ------------------------------------------------------------------
		if (!startHidden) {
			global.updateTimeout = setTimeout(() => {
				if (!mainWindow) {
					console.warn(
						"Auto-update check timed out – launching main window without result"
					);
					showMainWindowWhenReady();
				}
			}, UPDATE_CHECK_TIMEOUT);
		}
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

	// ---------------------------------------------------------------------------
	// Guard against stray "default Electron" windows
	// ---------------------------------------------------------------------------
	// In some edge-cases (particularly around auto-launch on Windows) the OS may
	// spawn an additional bare Electron process that opens Electron's default
	// documentation page.  If that process survives long enough for our code to
	// run, it appears as an extra BrowserWindow alongside the real app.  The
	// following listener detects such windows and closes them immediately so the
	// user never sees them.

	app.on("browser-window-created", (_event, window) => {
		const wc = window.webContents;
		// We only want to run the check once the first page has loaded.
		wc.once("did-finish-load", () => {
			const url = wc.getURL();
			// Electron's default page lives on electronjs.org – close those.
			if (
				url.startsWith("https://www.electronjs.org") ||
				url.includes("electronjs.org/docs")
			) {
				console.warn("Closing unexpected Electron documentation window: ", url);
				window.close();
			}
		});
	});
});

function clearUpdateTimeout() {
	if (global.updateTimeout) {
		clearTimeout(global.updateTimeout);
		global.updateTimeout = undefined;
	}
}

autoUpdater.on("checking-for-update", () => {
	installerWindow?.webContents.send("update-status", "checking");
});

autoUpdater.on("update-available", () => {
	installerWindow?.webContents.send("update-status", "update-available");
	// We intentionally keep the timeout running here – if the download takes
	// too long the watchdog will still fire and launch the main window to
	// avoid locking the user out of the application.
});

autoUpdater.on("download-progress", () => {
	installerWindow?.webContents.send("update-status", "downloading");
});

autoUpdater.on("update-downloaded", () => {
	installerWindow?.webContents.send("update-status", "update-downloaded");
	if (mainWindow) {
		mainWindow.webContents.send("update-status", "update-downloaded");
	}
	clearUpdateTimeout();
});

autoUpdater.on("update-not-available", () => {
	installerWindow?.webContents.send("update-status", "up-to-date");
	clearUpdateTimeout();
	if (startHidden) {
		// If starting hidden, main window should already be created
		if (!mainWindow) {
			createMainWindow();
		}
	} else {
		showMainWindowWhenReady();
	}
});

autoUpdater.on("error", (err) => {
	console.error(err);
	installerWindow?.webContents.send("update-status", "error");
	clearUpdateTimeout();
	if (startHidden) {
		// If starting hidden, main window should already be created
		if (!mainWindow) {
			createMainWindow();
		}
	} else {
		showMainWindowWhenReady();
	}
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
	if (process.platform !== "darwin" && !isDev) {
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

// Don't enforce single-instance behaviour in development – when
// dev-servers or hot-reloaders restart Electron quickly the previous
// instance might not have released its lock yet, causing the new one to
// exit immediately. We still keep the check for production builds.
if (!isDev && !app.requestSingleInstanceLock()) {
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

// ---------------------------------------------------------------------------
// Auto-start configuration
// ---------------------------------------------------------------------------
ipcMain.handle("set-startup", (_e, { enabled, hidden }) => {
	// Base options that work cross-platform
	const settings = {
		openAtLogin: !!enabled,
	};

	if (process.platform === "darwin") {
		// macOS can simply toggle visibility via `openAsHidden`
		settings.openAsHidden = !!hidden;
	} else if (process.platform === "win32") {
		// Windows (Squirrel) requires launching via Update.exe so we need to
		// specify the correct executable and arguments.  Failing to do so causes
		// Windows to start the bare Electron runtime which shows the default
		// Electron documentation window.

		// Path to the Squirrel helper that lives next to our app executable
		const updateExe = path.join(
			path.dirname(process.execPath),
			"..",
			"Update.exe"
		);

		const exeName = path.basename(process.execPath);

		settings.path = updateExe;
		settings.args = [
			"--processStart",
			exeName,
			...(hidden ? ["--process-start-args", "--hidden"] : []),
		];
	} else {
		// Linux & others – just forward the flag
		settings.args = hidden ? ["--hidden"] : [];
	}

	app.setLoginItemSettings(settings);
	return app.getLoginItemSettings();
});

ipcMain.handle("get-startup", () => {
	const s = app.getLoginItemSettings();

	// Determine whether the hidden flag is present in any of the stored args
	const hasHidden = Array.isArray(s.args)
		? s.args.some((a) => a.includes("--hidden"))
		: s.openAsHidden;

	return {
		enabled: s.openAtLogin,
		hidden: hasHidden,
	};
});

ipcMain.handle("install-update", () => {
	autoUpdater.quitAndInstall();
});
