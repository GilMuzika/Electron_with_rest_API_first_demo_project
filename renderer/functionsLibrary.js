"use strict";
const axios = require('axios');
const { nativeImage } = require('electron');


let messageDivOnLoginCard;
let getAllElementsEventListenerFunc;

// האחד והיחיד
let allElementsCard = document.getElementById('getAllElementsCard_');

// האחד והיחיד
let getAllElementsButton = document.getElementById('get_all_elements_button_');


exports.getAjaxResultPost = (url, data, headers) => {

    return new Promise((resolve, reject) => {
        axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
        axios.post(url, data, {headers})
        .then(res=>  {
            resolve(res);
        })
        .catch(err => {
            console.log('caught in  getAjaxResultPost:');
            console.log(err);
            //alert(`caught in  getAjaxResultPost: \n${JSON.stringify(err)}`);
            reject(err);
        });
    });

}

exports.getAjaxResultPostForGet = (url, headers) => {
    //alert(`In Firer: \n${url}, ${stopFactor}`);
    return new Promise((resolve, reject) => {
        axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*';
        axios.get(url, {headers})
        .then(res=>  {
            resolve(res);
        })
        .catch(err => {
            //console.log('In getAjaxResultPostForGet - error responce:');
            console.log(`caught in  getAjaxResultPostForGet: \n${JSON.stringify(err)}`);
            reject(err);
        });
    });
}

//"card" id DOM element that DIV  can be appended to it as a child, "message" is string,
//after apending a div with "message" as innerText to "card",
//a reference to the appended  DIV is returned to the caller for removing if needed
exports.writeMessageOnCard = (card, message, optionalMessageDivChildNode) => {
    debugger;
    for(let s in card.children) {
        if(card.children[s].classList !== undefined)
            card.children[s].classList.add('hide');
    }
    const messageDiv = document.createElement('div');

    messageDiv.style = 'text-align: center;';
    let childOfMessageDiv = document.createElement('div');
    childOfMessageDiv.innerText = message;
    messageDiv.setAttribute('data-digitalstump', card.id);
    messageDiv.appendChild(childOfMessageDiv);
    if(optionalMessageDivChildNode !== undefined) {
        messageDiv.appendChild(optionalMessageDivChildNode);
    }

    card.appendChild(messageDiv);
    return messageDiv;
};


//restores a card to a normal state after writing a message on it. 
//"messageDivForRemoving" is  "messageDiv" from the previous function ("writeMessageOnCard"),
//but it's importatnt to get it from the caller, because there is a condition, and it also can be taken as an undefined variable.
exports.restoreCardToNormal = (card, messageDivForRemoving) => {
    debugger;
    this.hideAllCards();

    card.classList.remove('hide');
    card.classList.add('show-flex');

    for(let s in card.children) {
        if(card.children[s].classList !== undefined)
        card.children[s].classList.remove('hide');
    }

    if(messageDivForRemoving !== undefined)
        if(card.contains(messageDivForRemoving)) {
            card.removeChild(messageDivForRemoving);
        }
};

//if "messageDiv" (a div with a message) by some reason wasn't removed by reference in "restoreCardToNormal" function or otherwise,
//it can be removed by dataset tag, when the tag is the card id
exports.washCardUp = (card) => {
    for(let s in card.children) {
        if(card.children[s].dataset !== undefined && card.children[s].dataset.digitalstump !== undefined && card.children[s].dataset.digitalstump !== null && card.children[s].dataset.digitalstump === card.id)
            card.removeChild(card.children[s]);
    }
};



exports.hideAllCards = (allcardsContainer) => {
    if(allcardsContainer === undefined || allcardsContainer === null)
        allcardsContainer = document.getElementById('all-cards_');

        let hasChildrenBool = allcardsContainer.children.length > 0 ? true : false;
        if(hasChildrenBool) {
            for(let s in allcardsContainer.children){
                if(allcardsContainer.children[s].classList !== undefined && allcardsContainer.children[s].classList !== null && (![...allcardsContainer.children[s].classList].includes('hide'))) {
                    allcardsContainer.children[s].classList.add('hide');
                }

                //removing all the clases which names begin with "show"
                let re = /^show/gi;
                if(allcardsContainer.children[s].classList !== undefined && allcardsContainer.children[s].classList !== null) {
                    for(let ss in allcardsContainer.children[s].classList) {
                        let className = allcardsContainer.children[s].classList[ss];
                        let testBool = re.test(className);
                        if(testBool){
                            allcardsContainer.children[s].classList.remove(allcardsContainer.children[s].classList[ss]);
                        }
                    }
                }
            }
        }

   
};


exports.clearChildren = (node) => {
    while(node.firstChild)
        node.removeChild(node.lastChild);
};


// Important note!
// The method in the backend that this funcion uses must return an array of 'ready to use' objects
// that represents the database entries, nor the raw ones
// (the raw objects contain uniqe identificators that relate to other objects that need to be additionally extracted from the database, 
// and then the 'end-user' object must be constracted, 'ready to use' objects are already constructed and contain only human-readable information)
exports.getAllAndRenderThem = async (e, allElementsCard, getAllElementsButton, urlInTheBackendStr, constructOneCallback) => {
    debugger;

    //Erasing previous information
    this.clearChildren(allElementsCard.children[0]);

    let jwtToken = localStorage.getItem('login-token');

    let thisButtonInnerText = getAllElementsButton.innerText;
    
    let answer;
    if(jwtToken !== null && jwtToken !== undefined) {
        const headers = {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
            'From': 'local'
        };

        getAllElementsButton.innerText = 'please wait';
        getAllElementsButton.disabled = true;
        let errorBackendMessage;
        let wholeError;
        answer = await this.getAjaxResultPostForGet(urlInTheBackendStr, headers).catch(err => {
            debugger; 
            wholeError = err; 
            if(err.response) {
                if(typeof err.response.data === 'object') {
                    errorBackendMessage = err.response.data.ExceptionMessage;
                }
                else errorBackendMessage =  err.response.data;
            }
            else errorBackendMessage = err.message;
        });
        if(errorBackendMessage === undefined) {
            debugger;
            const table = document.createElement('table');
            const tbody = document.createElement('tbody');
            const thead = document.createElement('thead');
            const tableBootstrapClass = document.createAttribute('class');
            tableBootstrapClass.value = 'table';
            const tableStrippedBootstrapClass = document.createAttribute('class');
            tableStrippedBootstrapClass.value = 'table-stripped';
            table.setAttributeNode(tableBootstrapClass);
            table.setAttributeNode(tableStrippedBootstrapClass);
            table.appendChild(thead);
            table.appendChild(tbody);

            //here the table become visible
            allElementsCard.children[0].appendChild(table);

            debugger;
            table.setAttribute('border', 1);
            let allAirlines = answer.data;

            let trow_head = await constructOneCallback(allAirlines[0], true);
            thead.appendChild(trow_head);

            for(let s in allAirlines) {
                //here each row of the table being appended to the table and become visible
                let trow = await constructOneCallback(allAirlines[s], false);
                tbody.appendChild(trow);
            }
            

            getAllElementsButton.innerText = thisButtonInnerText;
            getAllElementsButton.disabled = false;
        }
        else {
            messageDivOnLoginCard = this.writeMessageOnCard(allElementsCard, errorBackendMessage);
            getAllElementsButton.innerText = thisButtonInnerText;
            getAllElementsButton.disabled = false;
        }
    }
    else {
        let button = document.createElement('button');
        button.innerText = 'Go to registration';
        button.addEventListener('click', (e) => {    
            let loginCard = document.getElementById('loginCard_');
            this.washCardUp(loginCard);
            this.restoreCardToNormal(loginCard, messageDivOnLoginCard);
            
        });
        messageDivOnLoginCard = this.writeMessageOnCard(allElementsCard, 'You don\'t have a registration token. Pleaselogin first.', button);
    }

};




exports.dropDownItemEventListenerLogic = (e, urlInTheBackendStr, constructOneCallbackFunc) => {
    getAllElementsButton.innerText = e.target.innerText;
    debugger;
    this.clearChildren(allElementsCard.children[0]);
    this.restoreCardToNormal(allElementsCard, messageDivOnLoginCard);

    if(getAllElementsEventListenerFunc !== undefined)
        getAllElementsButton.removeEventListener('click', getAllElementsEventListenerFunc);
    
    getAllElementsEventListenerFunc = async (e) => {
        await this.getAllAndRenderThem(e, allElementsCard, getAllElementsButton, urlInTheBackendStr,  constructOneCallbackFunc);        
    };

    getAllElementsButton.addEventListener('click', getAllElementsEventListenerFunc);
};

exports.validateUrl = (value) => {
	return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

exports.isObjectContainsKeyWith = (object, withWhatStr) => {
    if(typeof object !== 'object' || typeof withWhatStr !== 'string')
            return false;
    for(let s in object) {
        if(s.includes(withWhatStr))
            return true;
    }
    return false;
};

exports.constructOne = async (one, istableHeadBool) => {
    const tr = document.createElement('tr');
    for(let s in one) {
        debugger;
            if(typeof one[s] !== 'object') {
                //if(s !== 'iD' && s !== 'StatusMessage' && s !== 'StatusColor') {
                        const td = document.createElement('td');
                        const th = document.createElement('th');
                        td.setAttribute('class', 'standard-grid-table-cell');
                        th.setAttribute('class', 'standard-grid-table-cell');
                        

                            if(istableHeadBool) {
                                th.innerText = s;
                            } else {
                                if(s !== 'Image') {
                                td.innerText = one[s];
                                }
                                else {
                                    const img = document.createElement('img');
                                    let size = nativeImage.createFromDataURL(one[s]).getSize();
                                    td.setAttribute('width', size.width);
                                    img.setAttribute('src', one[s]);
                                    td.appendChild(img);
                                }
                            }


                        if(istableHeadBool)
                            tr.appendChild(th)
                        else
                            tr.appendChild(td);
                //}
            }

    }
    return tr;
 }; 



 exports.addNewDropdownItemFromObject = (dropDownMenu, itemObj) => {
    debugger;
    let newItem = document.createElement('a');
    newItem.setAttribute('class', 'dropdown-item');
    newItem.setAttribute('href', '#');
    newItem.setAttribute('id', itemObj.id);
    newItem.innerText = itemObj.text;
    newItem.addEventListener('click', (e) => {
        this.dropDownItemEventListenerLogic(e, itemObj.url, this.constructOne);    
    });

    dropDownMenu.appendChild(newItem);
    return newItem;
};



exports.clearUserDropdownItems = (dropDownMenu, userItemsObj) => {
    let userDropdownItemsIdsArr = [];
    for(let s in userItemsObj) {
        for(let d in dropDownMenu.children) {
            if(dropDownMenu.children[d].id === userItemsObj[s].id) {
                dropDownMenu.removeChild(dropDownMenu.children[d]);
                userDropdownItemsIdsArr.push(userItemsObj[s].id);
            }
        }

    }
    return userDropdownItemsIdsArr;
};