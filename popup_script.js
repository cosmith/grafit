// Based on http://bl.ocks.org/mbostock/3883245
(function () {
    'use strict';
    /*jslint browser: true */
    /*global chrome, console, alert, d3 */

    var data = [];


    function createGraph() {
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = document.width - margin.left - margin.right - 20,
            height = document.height - margin.top - margin.bottom - 20;

        var parseDate = d3.time.format("%H:%M").parse;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.val); });

        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain(d3.extent(data, function(d) { return d.val; }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
    }


    // Add listener to get the data
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log("[onMessage]", request);
        if (request.method === "sendData") {
            data.push(request.data);
        }
    });

}());
