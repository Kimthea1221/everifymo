import { BrowserWindow as e, app as t } from "electron";
import { fileURLToPath as n } from "url";
import r from "path";
//#region src/electron/main.js
var i = r.dirname(n(import.meta.url)), a = null, o = null;
function s() {
	a = new e({
		width: 1280,
		height: 800,
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			nodeIntegration: !1,
			contextIsolation: !0,
			preload: r.join(i, "preload.cjs")
		}
	}), a.webContents.openDevTools(), a.webContents.on("did-finish-load", () => {
		o &&= (a.webContents.send("deep-link-token", o), null);
	}), process.env.VITE_DEV_SERVER_URL ? a.loadURL(process.env.VITE_DEV_SERVER_URL) : a.loadFile(r.join(i, "../../dist/index.html"));
}
console.log("argv:", process.argv), console.log("execPath:", process.execPath), process.env.VITE_DEV_SERVER_URL ? t.setAsDefaultProtocolClient("everifymo", process.execPath, [r.resolve(process.argv[1])]) : t.setAsDefaultProtocolClient("everifymo"), t.requestSingleInstanceLock() ? (t.on("second-instance", (e, t) => {
	let n = t.find((e) => e.startsWith("everifymo://"));
	n && c(n);
}), t.whenReady().then(() => {
	s();
	let e = process.argv.find((e) => e.startsWith("everifymo://"));
	e && c(e);
})) : t.quit(), t.on("open-url", (e, t) => {
	c(t);
});
function c(e) {
	let t = new URL(e).searchParams.get("token");
	a ? (a.isMinimized() && a.restore(), a.show(), a.focus(), a.webContents.send("deep-link-token", t)) : o = t;
}
t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
});
//#endregion
export {};
