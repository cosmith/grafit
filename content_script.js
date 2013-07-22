// This code is injected into every page
(function () {
    'use strict';
    /*jslint browser: true */
    /*global chrome, console */

    var latestClick;

    document.onmousedown = function (evt) {
        latestClick = evt.target;
    };

    function getSource() {
        var message = {
            method: "returnSource",
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