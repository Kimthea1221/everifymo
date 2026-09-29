import { BrowserWindow as e, Menu as t, app as n } from "electron";
import { fileURLToPath as r } from "url";
import i from "path";
//#region src/electron/main.js
var a = i.dirname(r(import.meta.url)), o = null, s = null;
function c() {
	o = new e({
		width: 1280,
		height: 800,
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			nodeIntegration: !1,
			contextIsolation: !0,
			preload: i.join(a, "preload.cjs")
		}
	});
	mainWindow.webContents.openDevTools();
	mainWindow.webContents.on("did-finish-load", () => {
		if (pendingDeepLink) {
			mainWindow.webContents.send("deep-link-token", pendingDeepLink);
			pendingDeepLink = null;
		}
	});
	if (process.env.VITE_DEV_SERVER_URL) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	else mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
}
console.log("argv:", process.argv);
console.log("execPath:", process.execPath);
if (process.env.VITE_DEV_SERVER_URL) app.setAsDefaultProtocolClient("icmda", process.execPath, [path.resolve(process.argv[1])]);
else app.setAsDefaultProtocolClient("icmda");
if (!app.requestSingleInstanceLock()) app.quit();
else {
	app.on("second-instance", (event, argv) => {
		const url = argv.find((arg) => arg.startsWith("icmda://"));
		if (url) handleDeepLink(url);
	});
	app.whenReady().then(() => {
		Menu.setApplicationMenu(null);
		createWindow();
		const launchUrl = process.argv.find((arg) => arg.startsWith("icmda://"));
		if (launchUrl) handleDeepLink(launchUrl);
	});
}
console.log("argv:", process.argv), console.log("execPath:", process.execPath), process.env.VITE_DEV_SERVER_URL ? n.setAsDefaultProtocolClient("icmda", process.execPath, [i.resolve(process.argv[1])]) : n.setAsDefaultProtocolClient("icmda"), n.requestSingleInstanceLock() ? (n.on("second-instance", (e, t) => {
	let n = t.find((e) => e.startsWith("icmda://"));
	n && l(n);
}), n.whenReady().then(() => {
	t.setApplicationMenu(null), c();
	let e = process.argv.find((e) => e.startsWith("icmda://"));
	e && l(e);
})) : n.quit(), n.on("open-url", (e, t) => {
	l(t);
});
function l(e) {
	let t = new URL(e).searchParams.get("token");
	o ? (o.isMinimized() && o.restore(), o.show(), o.focus(), o.webContents.send("deep-link-token", t)) : s = t;
}
n.on("window-all-closed", () => {
	process.platform !== "darwin" && n.quit();
});
//#endregion
export {};
