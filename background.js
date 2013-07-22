(function () {
    'use strict';
    /*jslint browser: true */
    /*global chrome, console, alert */


    // Initialize the extension
    function init() {
        chrome.contextMenus.onClicked.addListener(onClickHandler);

        // Set up context menu tree at install time.
        chrome.runtime.onInstalled.addListener(function () {
            console.info("Installation...");

            chrome.contextMenus.create({
                "title": "graph this !",
                "contexts": ["selection"],
                "id": "context_selection"
            });
            console.info("Context menu item created");
        });
    }


    // The onClicked callback function.
    function onClickHandler(info, tab) {
        // console.log("item " + info.menuItemId + " was clicked");
        // console.log("info: " + JSON.stringify(info));
        // console.log("tab: " + JSON.stringify(tab));

        if (info.editable === false) {
            console.info("User selected text: " + info.selectionText);
            console.info("Page URL: " + info.pageUrl);

            sendRequest(info.selectionText);
        }
    }


    // Ask the page to send us the info we need
    function sendRequest(selectionText) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {method: "sendSource"},
                function (response) {
                    getSelectedTag(selectionText, response.click);
                }
            );
        });
    }


    // Process the data we received from the page
    function getSelectedTag(selectionText, click) {
        if (isNaN(parseFloat(selectionText))) {
            alert("You have to select a number!");
        }
        console.log(parseFloat(selectionText));
        console.log(click);
    }


    init();
}());