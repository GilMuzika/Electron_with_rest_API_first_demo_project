"use strict";
const functionsLibrary = require('./functionsLibrary');
//const bcrypt = require('bcrypt'); //useful for crypting

let messageDivOnLoginCard;

let loginCard = document.getElementById('loginCard_');
let loginDropdownMenuItem = document.getElementById('login-dropdown-item_');
let loginUsernameTextField = document.getElementById('login_username_');
let loginPasswordTextField = document.getElementById('login_password_');
let loginSendButton = document.getElementById('get_login_button_');


//showing login card
loginDropdownMenuItem.addEventListener('click', (e) => {
    functionsLibrary.restoreCardToNormal(loginCard, messageDivOnLoginCard);
});

//obtaining the token and saving it in the local storage if obtained
loginSendButton.addEventListener('click', async(e) => {
    debugger;
    let thisButtonInnerText = e.target.innerText;

    const headers = {
        type: "POST",
        contentType: "application/json",
        dataType: "json",
    };
    const url = `https://localhost:44361/api/jwt/createJwtToken`;
    const data = {
        "username": loginUsernameTextField.value,
        "password": loginPasswordTextField.value
    };

    e.target.innerText = 'please wait';
    e.target.disabled = true;
    let error;
    let user = await functionsLibrary.getAjaxResultPost(url, data, headers).catch(err => error = err);
    if(error === undefined) {
        localStorage.setItem('login-token', user.data.Token);
    }

//user.data.Token
    e.target.innerText = thisButtonInnerText;
    e.target.disabled = false;

    let message  = error === undefined ?  'Your registration token is obtained and sucsessfully stored.' : error.message;
    messageDivOnLoginCard = functionsLibrary.writeMessageOnCard(loginCard, message);
});
