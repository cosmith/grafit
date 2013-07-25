// This code is injected into every page
(function () {
    'use strict';
    /*jslint browser: true */
    /*global chrome, console */

    // Get the position of a element in the list of its siblings
    function getElementPosition(element, siblings) {
        var position = 0,
            i = 0;

        for (i = 0; i < siblings.length; i += 1) {
            if (element === siblings[i]) {
                position = i;
                break;
            }
        }

        return position;
    }

    // Get the list of parents and position of the clicked element
    function getParents(clicked) {
        var el = clicked,
            parents = [],
            position = 0;

        while (el.parentElement.nodeName !== 'HTML') {
            position = getElementPosition(el, el.parentElement.children);
            el = el.parentElement;
            parents.push(position);
        }

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