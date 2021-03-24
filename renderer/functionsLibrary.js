"use strict";
const axios = require('axios');


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
    this.hideAllCards();

    card.classList.remove('hide');
    card.classList.add('show-flex');

    for(let s in card.children) {
        if(card.children[s].classList !== undefined)
        card.children[s].classList.remove('hide');
    }

    if(messageDivForRemoving !== undefined)
        card.removeChild(messageDivForRemoving);
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