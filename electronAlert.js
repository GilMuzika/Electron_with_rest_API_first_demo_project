"use strict";
const ElectronAlert = require('electron-alert');

const alert = new ElectronAlert();


exports.displayAlertMessage = (messageStr) => {
    debugger;
    // https://sweetalert2.github.io/v8.html#configuration
    alert.fireFrameless({
        text: messageStr,
        backgroundColor: '#ssssss',
        showConfirmButton: false,
        timer: 5000,
        background: '#dedede',
        width: '50%',
    });
};