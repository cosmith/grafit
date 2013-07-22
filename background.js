(function () {
    'use strict';
    /*jslint browser: true */
    /*global chrome, console, alert */


    // Get the list of parents of the clicked element
    function getParents(clicked) {
        var el = clicked,
            parents = [];

        while (el.parentElement !== null) {
            el = el.parentElement;
            parents.append(el);
        }

        return parents;
    }


    // Get the source of the page
    function fetchPage(url) {
        // TODO: get the page source!
        var pageSource = url;
        return pageSource;
    }


    // Get the value of our element from the source and the list of parents
    function getValue(pageSource, parents) {
        var source = pageSource,
            value,
            i = 0,
            currentEl;

        for (i = parents.length - 1; i >= 0; i -= 1) {
            currentEl = parents[i].nodeName;

            // TODO: get the actual thing
            source = pageSource.getElementByTagName(currentEl)[0];
        }

        value = parseFloat(source);
        return value;
    }


    // Process the data we received from the page
    function getSelectedTag(selectionText, pageUrl, clicked) {
        var parents = [],
            source,
            value;

        if (isNaN(parseFloat(selectionText))) {
            alert("You have to select a number!");
        } else {
            parents = getParents(clicked);

            source = fetchPage(pageUrl);
            value = getValue(source, parents);

            console.log(value);
        }
    }


    // Ask the page to send us the info we need
    function sendRequest(selectionText, pageUrl) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {method: "sendSource"},
                function (response) {
                    getSelectedTag(selectionText, pageUrl, response.click);
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