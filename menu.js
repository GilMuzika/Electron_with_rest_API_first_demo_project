"use strict";
//Modules
const { Menu, shell, ipcMain } = require('electron');
const fs = require('fs');

let webContents;

const { EventEmitter } = require('events');
exports.eventEmitter = new EventEmitter();



let template;

ipcMain.handle('take-dropdown-items-names', (e, data) => {

    let dropDownMenuButtonInfo = data.pop();
    if(dropDownMenuButtonInfo !== undefined && dropDownMenuButtonInfo !== null) {

           this.eventEmitter.emit('dropDownMenuButtonTextTaken', dropDownMenuButtonInfo);  
    }

        let dropdownSubmenu  = data.map((one) => {
            return {
                label: `&${one.innerText}`,
                click: () => {
                    webContents = e.sender;
                    e.sender.send(`DROPDOWNITEM_${one.id}`);
                    
                  }
            };
        });

    if(template !== undefined) {
        template[0].submenu = dropdownSubmenu;

                //Build menu from template
                let menu = Menu.buildFromTemplate(template);
    
                Menu.setApplicationMenu(menu);
    }



    
  });


//Module function to create the app menu
module.exports.currentMenu = (dropDownMenuButtonText, mainWinWebContents) => {
debugger;
webContents = mainWinWebContents;

    let firstMenuItemLabel = '&Dropdown';
    if(dropDownMenuButtonText !== undefined)
    firstMenuItemLabel = `&${dropDownMenuButtonText}`;

    //Menu template
    template = [
        {
            label: firstMenuItemLabel,
            submenu: []
        },
        {
            role: 'editMenu',
        }, 
        {
            role: 'windowMenu'
        },
        {
            role: 'appMenu'
        },
        {
            label: '&Help',
            role: 'help',
            submenu: [{
                label: '&Git repository',
                click: () => {
                    debugger;
                        fs.readFile('config.txt', 'utf8', (err, data) => {
                            debugger;
                            let configObj = JSON.parse(data);
                            shell.openExternal(configObj.aboutTheApp);
                        });
                }
            }]
        }
    ];

    //creATE MAC APP MENU
    //process.platform -> 'win32' or 'win64' for Windows, 'linux' for Linux, amd 'darwin' for Mac
    if(process.platform === 'darwin')
            template.unshift({role: 'appMenu'}); //unshift is add element to the beginning of the array


};