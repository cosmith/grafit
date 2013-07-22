(function () {
    'use strict';
    /*jslint browser: true */
    /*global chrome, console, alert */


    // Get the source of the page
    function fetchPage(url, parents) {
        var xhr = new XMLHttpRequest(),
            pageSource;
        
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                pageSource = xhr.responseText;
                console.log('Source retrieved!');
                return getValue(pageSource, parents);
            }
        }
        xhr.send();
    }


    // Get the value of our element from the source and the list of parents
    function getValue(pageSource, parents) {
        var source,
            value,
            i = 0,
            currentEl;
        
        // we inject our HTML in a div to be able to parse it
        source = document.createElement('div');
        source.innerHTML = pageSource;
        console.log("Source", source);
        
        // go through every parent to find the new value of our element
        for (i = parents.length - 1; i >= 0; i -= 1) {
            console.log("Source", source);

            currentEl = parents[i];
            // TODO: get the actual thing
            source = source.getElementsByTagName(currentEl)[0];
        }

        value = parseFloat(source);

        console.log("Value", value);
        console.log("Source", source);
        return value;
    }


    // Process the data we received from the page
    function getSelectedTag(selectionText, pageUrl, parents) {
        var value;

        if (isNaN(parseFloat(selectionText))) {
            alert("You have to select a number!");
        } else {
            value = fetchPage(pageUrl, parents);
        }
    }


    // Ask the page to send us the info we need
    function sendRequest(selectionText, pageUrl) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {method: "sendSource"},
                function (response) {
                    getSelectedTag(selectionText, pageUrl, response.parents);
                }
            );
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

            sendRequest(info.selectionText, info.pageUrl);
        }
    }


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


    init();
}());