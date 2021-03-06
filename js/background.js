(function () {
    'use strict';
    /*jslint browser: true */
    /*global chrome, console, alert */

    var timer,
        popupWindowId,
        refreshRate = 10, // interval in seconds
        pageInfo = {url: "", parents: ""};

    // Get the source of the page
    function fetchPage(url, parents, callback) {
        var xhr = new XMLHttpRequest(),
            pageSource;

        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                pageSource = xhr.responseText;
                console.log("[fetchPage] Source retrieved!");
                callback(pageSource, parents);
            }
        };
        xhr.send();
    }


    // Parse a string to get the value of our number
    function parseFloatFromHtml(html) {
        var value,
            exp;

        // Match the first group of numbers, delimited by letters
        // Regex: one digit, followed by a group of any of:
        // digit, space, comma, dot, or e followed by a digit (for exponentiation)
        exp = html.match(/\d[\d|\ |\,|\.|e\d]+/g);
        if (exp.length > 0) {
            value = parseFloat(exp[0]);
        }

        return value;
    }


    // Get the value of our element from the source and the list of parents
    function getValue(pageSource, parents) {
        var source,
            value,
            i = 0,
            position = 0;

        // We inject our HTML in a div to be able to parse it
        source = new DOMParser().parseFromString(pageSource, 'text/html');
        source = source.getElementsByTagName("body")[0];

        // Traverse the node tree to find the new value of our element
        for (i = parents.length - 1; i >= 0; i -= 1) {
            position = parents[i];
            source = source.children[position];
        }

        // Parse the element to find our value
        value = parseFloatFromHtml(source.innerHTML);

        console.log("[getValue ] Value:", value);
        console.log("[getValue ] Source:", source.innerHTML);
        return value;
    }


    function onPageFetched(source, parents) {
        var value = getValue(source, parents),
            data;

        data = {
            date: new Date(Date.now()),
            val: value
        };

        sendDataToPopup("sendData", data);
    }


    // Process the data we received from the page
    function onInterval() {
        fetchPage(pageInfo.url, pageInfo.parents, onPageFetched);
    }


    // When we receive the data from the page, setup the timer
    function onContentScriptResponse(response) {
        pageInfo.parents = response.parents;
        onInterval();
        setupTimer();
    }


    // Setup timer
    function setupTimer() {
        clearInterval(timer);
        timer = setInterval(function () {
            onInterval();
        }, refreshRate * 1000);
    }


    // Ask the page to send us the info we need
    function sendRequest(pageUrl) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {method: "sendSource"},
                onContentScriptResponse
            );
        });
    }


    // Create the popup
    function createPopUp() {
        chrome.windows.create({
            url: "../views/popup.html",
            type: "popup",
            width: 500,
            height: 300
        }, function (window) {
            popupWindowId = window.id;

            // We send the page url to display it in the popup's title
            sendDataToPopup("sendPageInfo", {url: pageInfo.url});
        });
    }


    // Send data to the popup
    function sendDataToPopup(requestMethod, data) {
        var toSend = {"method": requestMethod, "data": data};
        chrome.tabs.query({active: true, windowId: popupWindowId}, function (tabs) {
            try {
                chrome.tabs.sendMessage(tabs[0].id, toSend, null);
            } catch (e) {
                // The popup is closed
                clearInterval(timer);
                console.log('[onInterval] Popup closed, removing timer');
            }
        });
    }

    // The onClicked callback function
    function onMenuClickHandler(info, tab) {
        if (info.editable === false) {
            console.log("[ onClick ] User selected text: " + info.selectionText);
            console.log("[ onClick ] Page URL: " + info.pageUrl);

            if (isNaN(parseFloat(info.selectionText))) {
                alert("You have to select a number!");
            } else {
                pageInfo.url = info.pageUrl;
                sendRequest(info.pageUrl);
                createPopUp();
            }
        }
    }


    // Persist the options and apply the changes
    function saveOptions(options) {
        refreshRate = options.refreshRate;
        localStorage.refreshRate = refreshRate;

        setupTimer();
    }


    // Add listener to update the refresh rate when changed in the popup
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.method === "sendOptions") {
            saveOptions(request.options);
        }
    });


    // Initialize the extension
    function init() {
        chrome.contextMenus.onClicked.addListener(onMenuClickHandler);

        // Set up context menu tree at install time.
        chrome.runtime.onInstalled.addListener(function () {
            console.log("[  init   ] Installation...");

            chrome.contextMenus.create({
                "title": "Graph this!",
                "contexts": ["selection"],
                "id": "context_selection"
            });
            console.info("[  init   ] Context menu item created");
        });
    }


    init();
}());



// http://stackoverflow.com/a/9251106/938089
/*
 * DOMParser HTML extension
 * 2012-02-02
 *
 * By Eli Grey, http://eligrey.com
 * Public domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*! @source https://gist.github.com/1129031 */
/*global document, DOMParser*/

(function(DOMParser) {
    "use strict";
    var DOMParser_proto = DOMParser.prototype,
        real_parseFromString = DOMParser_proto.parseFromString;

    // Firefox/Opera/IE throw errors on unsupported types
    try {
        // WebKit returns null on unsupported types
        if ((new DOMParser()).parseFromString("", "text/html")) {
            // text/html parsing is natively supported
            return;
        }
    } catch (ex) {}

    DOMParser_proto.parseFromString = function(markup, type) {
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
            var doc = document.implementation.createHTMLDocument(""),
                doc_elt = doc.documentElement,
                first_elt;

            doc_elt.innerHTML = markup;
            first_elt = doc_elt.firstElementChild;

            if (doc_elt.childElementCount === 1 &&
                first_elt.localName.toLowerCase() === "html") {
                doc.replaceChild(first_elt, doc_elt);
            }

            return doc;
        } else {
            return real_parseFromString.apply(this, arguments);
        }
    };
}(DOMParser));
