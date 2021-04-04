"use strict";
const { ipcRenderer } = require("electron");
const fs = require('fs');
const electronAlert = require('../electronAlert');

//https://github.com/sindresorhus/devtools-detect
//restricted to rrenderer only!!!!!
//use the global 'window' object!
const devToolsDetect = require('devtools-detect');
const functionsLibrary = require('./functionsLibrary');
ipcRenderer.on('keyboard-shortcut-pressed', (e, data) => {
    let isOpenMessageStr = devToolsDetect.isOpen ? 'DevTools is Closed' : 'Open';
});


const placeGakeToken = document.getElementById('place-fake-token-dropdown-item_');
const addMoreDropdownitemsCard = document.getElementById('add-more-dropdown-items-card_');

placeGakeToken.addEventListener('click', () => { 
    functionsLibrary.hideAllCards();

    let textmessage = 'your fake token is placed';
    fs.readFile(`${__dirname}\\fakeToken.txt`, 'utf8', (err, data) => {
        debugger;
        localStorage.setItem('login-token', data);
        if(err != null)
            textmessage = err;
            addMoreDropdownitemsCard.classList.remove('hide');
            functionsLibrary.writeMessageOnCard(addMoreDropdownitemsCard, textmessage);
    });


});

//"add more dropdown items" functionality
const dropDownMenu = document.getElementsByClassName('dropdown-menu')[0];
const addMoreDropdownMenuItemsDropdownMenuItem = document.getElementById('add-more-dropdown-items_');
//const addMoreDropdownitemsCard = document.getElementById('add-more-dropdown-items-card_');
const newMenuItemTextField = document.getElementById('new-menu-item-text_');
const newMenuItemUrlField = document.getElementById('new-menu-item-rest-api-url_');
const addNewMenuItemButton = document.getElementById('create-new-menu-item-button_');
const clearUserDropdownItemsButton = document.getElementById('clear-user-dropdown-items_');


addMoreDropdownMenuItemsDropdownMenuItem.addEventListener('click', (e) => {
    functionsLibrary.hideAllCards();
    functionsLibrary.restoreCardToNormal(addMoreDropdownitemsCard);
    functionsLibrary.washCardUp(addMoreDropdownitemsCard);
    //showing "addMoreDropdownitemsCard"
    if(addMoreDropdownitemsCard.classList.contains('hide'))
        addMoreDropdownitemsCard.classList.remove('hide');
});

addNewMenuItemButton.addEventListener('click', () => {
    debugger;
    let newMenuItemText = newMenuItemTextField.value;
    let newMenuItemUrl = newMenuItemUrlField.value;

    if(newMenuItemText === "" || !functionsLibrary.validateUrl(newMenuItemUrl)) {
        functionsLibrary.writeMessageOnCard(addMoreDropdownitemsCard, 'The text is empty or the URL isn\'t valid');
        return;
    }


    let newMenuItemTextAsId = newMenuItemText.toLowerCase().replace(/\s/gi, "-") + "_";
    let userDropdownItemsCollection  = JSON.parse(localStorage.getItem('user-dropdown-menu-items'));

    if(userDropdownItemsCollection !== null && functionsLibrary.isObjectContainsKeyWith(userDropdownItemsCollection, 'userDropdownItem')) {
        let lastDropDownKey;
        let re = /\d+/gi;

        Object.keys(userDropdownItemsCollection).forEach(function(key,index) {
            // key: the name of the object key
            // index: the ordinal position of the key within the object 
            //if(key.includes('userDropdownItem') && re.test(key))
                lastDropDownKey = key;
        });

        let lastDropDownKeyNum = parseInt(lastDropDownKey.match(re)[lastDropDownKey.match(re).length - 1]);
        debugger;
        userDropdownItemsCollection[`userDropdownItem_${++lastDropDownKeyNum}`] = {
            text: newMenuItemText,
            id: newMenuItemTextAsId,
            url: newMenuItemUrl
        };

        localStorage.setItem('user-dropdown-menu-items', JSON.stringify(userDropdownItemsCollection));
    }
    else{
            let objForSaving = {
                userDropdownItem_0: {

                text: newMenuItemText,
                id: newMenuItemTextAsId,
                url: newMenuItemUrl
                }
            };
            localStorage.setItem('user-dropdown-menu-items', JSON.stringify(objForSaving));
    }

    let itemObj = {
        text: newMenuItemText,
        id: newMenuItemTextAsId,
        url: newMenuItemUrl
        };

    ///////////////////////////////////// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! לקרוא לפונקציה הזאת
    debugger;
   //adding one item to the dropdown menu in this application instance 
   let newDropdownItem = functionsLibrary.addNewDropdownItemFromObject(dropDownMenu, itemObj);

   //adding one item to the app menu in this application instance
   let menuItemObj = {innerText: itemObj.text, id: itemObj.id }
   ipcRenderer.invoke('take-dropdown-items-names', [menuItemObj]);
   

   ipcRenderer.on(`DROPDOWNITEM_${itemObj.id}`, () => {
        debugger;

        newDropdownItem.click();

    });

    //enabling "clear users dropdown items" button
    if(clearUserDropdownItemsButton.disabled)
        clearUserDropdownItemsButton.disabled = false;

    //"adding complete" message
    functionsLibrary.writeMessageOnCard(addMoreDropdownitemsCard, `The item \n\"${itemObj.text}\"\n added`);
});



clearUserDropdownItemsButton.addEventListener('click', (e) => {
    let userDropdownItemsCollection  = JSON.parse(localStorage.getItem('user-dropdown-menu-items'));
    if(userDropdownItemsCollection === null || !functionsLibrary.isObjectContainsKeyWith(userDropdownItemsCollection, 'userDropdownItem')) 
        return;

    debugger;
    //clear users items fron the html dropdown menu
    let userDropdownItemsIdsArr = functionsLibrary.clearUserDropdownItems(dropDownMenu, userDropdownItemsCollection);  
    //clear the users items from the app menu
    ipcRenderer.invoke('clear-user-menu-items', userDropdownItemsIdsArr);
    //clear the users items from the local storage
    localStorage.removeItem('user-dropdown-menu-items');


    functionsLibrary.hideAllCards();
    addMoreDropdownitemsCard.classList.remove('hide');
    functionsLibrary.washCardUp(addMoreDropdownitemsCard);
    functionsLibrary.writeMessageOnCard(addMoreDropdownitemsCard, 'All user dropdown items are removed');

    e.target.disabled = true;
});


//זה מופעל כאשר התוכנה עולה
//mainWindow.once('ready-to-show');
ipcRenderer.on('reconstruct-user-dropdown-items', () => {

    let userDropdownItemsCollection  = JSON.parse(localStorage.getItem('user-dropdown-menu-items'));
    if(userDropdownItemsCollection === null || !functionsLibrary.isObjectContainsKeyWith(userDropdownItemsCollection, 'userDropdownItem')) {
        clearUserDropdownItemsButton.disabled = true;
        return;
    }

        Object.keys(userDropdownItemsCollection).forEach(function(key, index) {
            // key: the name of the object key
            // index: the ordinal position of the key within the object 
            functionsLibrary.addNewDropdownItemFromObject(dropDownMenu, userDropdownItemsCollection[key]);
        });
});

