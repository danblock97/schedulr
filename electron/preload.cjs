const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	isElectron: true,
	openExternal: (url) => ipcRenderer.send("open-external", url),
	onUpdateStatus: (callback) =>
		ipcRenderer.on("update-status", (_event, status) => callback(status)),
	windowAction: (action) => ipcRenderer.send("window-action", action),
	onSupabaseLogin: (cb) =>
		ipcRenderer.on("supabase-login", (_e, tokens) => cb(tokens)),
	onGlobalQuickAdd: (cb) => ipcRenderer.on("global-quick-add", () => cb()),
	setStartup: (opts) => ipcRenderer.invoke("set-startup", opts),
	getStartup: () => ipcRenderer.invoke("get-startup"),
	installUpdate: () => ipcRenderer.invoke("install-update"),
});
