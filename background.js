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
        };
        xhr.send();
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
        value = parseFloat(source.innerHTML.match(/\d+/g).join(''));

        console.log("Value", value);
        // console.log("Source", source);
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


    var timer;
    // Ask the page to send us the info we need
    function sendRequest(selectionText, pageUrl) {
        var onResponse = function (response) {
            getSelectedTag(selectionText, pageUrl, response.parents);
            clearInterval(timer);
            timer = setInterval(function() {
                getSelectedTag(selectionText, pageUrl, response.parents);
            }, 10 * 1000);
        };

        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {method: "sendSource"},
                onResponse
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