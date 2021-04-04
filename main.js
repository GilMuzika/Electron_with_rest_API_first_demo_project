"use strict";
// Modules
const {app, BrowserWindow, globalShortcut, screen, dialog, ipcMain } = require('electron');
const windowStateKeeper = require('electron-window-state');
const electronAlert = require('./electronAlert');
const menu = require('./menu');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let primaryDisplay;



let windowWidth; 
// Create a new BrowserWindow when `app` is ready
function createWindow () {
debugger;
  let state = windowStateKeeper({
    defaultWidth: windowWidth,
    defaultHeight: 650
  });


  mainWindow = new BrowserWindow({
    x: state.x, y: state.y,
    width: state.width, height: state.height,
    minWidth: windowWidth, 
    maxWidth: primaryDisplay.workArea.width,
    minHeight: Math.round(primaryDisplay.workArea.height - primaryDisplay.workArea.height / 4),
    webPreferences: { nodeIntegration: true },
    show: false
  })

    // Open DevTools - Remove for PRODUCTION!
    //mainWindow.webContents.openDevTools();

  // Load index.html into the new BrowserWindow
  mainWindow.loadFile('renderer/index.html');

  state.manage(mainWindow);


  // Listen for window being closed
  mainWindow.on('closed',  () => {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.send('reconstruct-user-dropdown-items');
    mainWindow.webContents.send('give-me-dropdown-items-names');
    debugger;
        menu.eventEmitter.on('dropDownMenuButtonTextTaken', (data) => {
          debugger;
          menu.currentMenu(data.innerText, mainWindow.webContents);
          mainWindow.show();    
      });

  });
}
//		

// Electron `app` is ready
app.on('ready', () => { 
  //the order of execution is important
  //"primaryDisplay" is used by "createWindow", so it must be created prior to execution of the function
	primaryDisplay = screen.getPrimaryDisplay();
  const defaultWindowWidth = Math.round(primaryDisplay.workArea.width - primaryDisplay.workArea.width / 2);
  windowWidth = defaultWindowWidth < 1000 ? defaultWindowWidth : 1000;
  createWindow();


  
});

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
debugger;
let toggleDevToolsShortcutStr = 'CommandOrControl+Shift+D';
app.whenReady().then(() => {
	// Register a 'CommandOrControl+Shift+D' shortcut listener.
	const ret = globalShortcut.register(toggleDevToolsShortcutStr, () => {
    debugger;
		mainWindow.toggleDevTools();
	})
debugger;
	if (!ret) {
		console.log('\n\n\nregistration of keyboard shortcut failed')
	}
	// Check whether a shortcut is registered.
	//console.log(globalShortcut.isRegistered(toggleDevToolsShortcutStr))

  // Suppressing the default "Ctrl-R" and "Ctrl-Shift-R" default keyboard shortcuts for refreshing
  // (Anyway, this is already done by having a custom-built menu)
globalShortcut.registerAll(['CommandOrControl + R', 'CommandOrControl + Shift + R'], () => {
  dialog.showMessageBox({
    type: 'question',
    message: '?Do you really want to reload',
    buttons: ['Yes', 'No']

  }).then(res => {
    debugger;
    let whatToDoFunc = res.response === 0 ? () => { 
      mainWindow.webContents.reload(); 
      electronAlert.displayAlertMessage('Reloaded');
    } : () => {  electronAlert.displayAlertMessage('Nothing changed'); };
    whatToDoFunc();
  });
});
debugger;
mainWindow.webContents.send('keyboard-shortcut-pressed');


});

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister(toggleDevToolsShortcutStr)

  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
});

ipcMain.handle('give-me-the-app-name', (e, data) => {
  e.sender.send('take-the-app-name', app.getName());
});







