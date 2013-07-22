(function () {
    'use strict';
    /*jslint browser: true */
    /*global chrome, console */


    // This code is injected into every page

    var latestClick;

    document.onmousedown = function (evt) {
        latestClick = evt.toElement.outerHTML;
    };

    function getSource() {
        var message = {
            method: "returnSource",
            pageSource: document.all[0].outerHTML,
            click: latestClick
        };

        return message;
    }


    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.method === "sendSource") {
            sendResponse(getSource());
        }
    });
}());