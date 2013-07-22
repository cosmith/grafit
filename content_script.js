// This code is injected into every page
(function () {
    'use strict';
    /*jslint browser: true */
    /*global chrome, console */

    // Get the list of parents of the clicked element
    function getParents(clicked) {
        var el = clicked,
            parents = [];

        while (el.parentElement.nodeName !== 'BODY') {
            el = el.parentElement;
            parents.push(el.nodeName);
        }
        console.log(parents);
        return parents;
    }


    var parents;

    document.onmousedown = function (evt) {
        parents = getParents(evt.target);
    };

    function getSource() {
        var message = {
            method: "returnSource",
            parents: parents
        };

        return message;
    }


    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.method === "sendSource") {
            sendResponse(getSource());
        }
    });
}());