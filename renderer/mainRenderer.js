"use strict";
const { ipcRenderer } = require("electron");
//https://github.com/sindresorhus/devtools-detect
//restricted to rrenderer only!!!!!
//use the global 'window' object!
const devToolsDetect = require('devtools-detect');

ipcRenderer.on('keyboard-shortcut-pressed', (e, data) => {
    let isOpenMessageStr = devToolsDetect.isOpen ? 'DevTools is Closed' : 'Open';
});
