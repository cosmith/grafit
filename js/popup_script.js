// Based on http://bl.ocks.org/mbostock/3883245

(function () {
    'use strict';
    /*jslint browser: true */
    /*global chrome, console, alert, d3 */

    var data = [],
        optionsVisible = true;

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = document.width - margin.left - margin.right - 20,
        height = document.height - margin.top - margin.bottom - 20;

    var graph = d3.select("#graph").append("svg:svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);
    
    var line = d3.svg.line().x(function (d) { return x(d.date); })
                            .y(function (d) { return y(d.val); })
                            .interpolate("basis");

    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left");

    var parseDate = d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ").parse;

    // init graph
    graph.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    graph.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    graph.append("path").attr("id", "lineGraph").attr("d", line(data));


    function update(transitionDelay) {
        // data join
        var path = graph.selectAll("#lineGraph")
            .data([data])
            .attr("d", line);

        // update existing
        path.attr("class", "line");

        // enter
        path.enter()
            .append("path")
            .data(data)
            .attr("class", "line")
            .attr("d", line);

        // enter + update
        path.transition()
            .ease("linear")
            .duration(transitionDelay)
            .attr("d", line);

        // update axis
        x.domain(d3.extent(data, function (d) { return d.date; }));
        y.domain(d3.extent(data, function (d) { return d.val; }));

        graph.selectAll(".y.axis")
          .transition()
            .ease("linear")
            .duration(transitionDelay)
            .call(yAxis)
        graph.selectAll(".x.axis")
          .transition()
            .ease("linear")
            .duration(transitionDelay)
            .call(xAxis);
    }


    // Display a message while waiting for data
    function displayWaiting() {
        var waiting = graph.selectAll(".waiting");
        if (data.length < 3 && waiting[0].length == 0) {
            graph.append("text")
                .attr("class", "waiting")
                .attr("x", width/2 - 50)
                .attr("y", height/2)
                .text("Waiting for more data...");
        } 

        if (data.length >= 3 && waiting[0].length > 0) {
            graph.selectAll(".waiting")
                .remove();
        }
    }


    // Options handling
    function setupOptions() {
        // add event listeners on dropdowns
        d3.select("#refreshRate")
            .on('change', onRefreshRateChanged);
    }

    function onRefreshRateChanged(e) {
        var refreshRate;

        d3.selectAll("option")
            .each(function (d, i) { 
                if (this.selected) {
                    refreshRate = this.value;
                }
            });

        // send the updated rate to the background
        chrome.runtime.sendMessage({
            "method": "sendOptions",
            "options": {
                "refreshRate": refreshRate
            }
        });
    }


    // Visual effects
    d3.select("#options-button")
        .on("click", onOptionsClick);

    // Show/hide the options panel
    function onOptionsClick() {
        var val = optionsVisible ? 0 : -40;

        d3.select("#options-panel")
            .transition()
            .style("top", val + "px");

        optionsVisible = !optionsVisible;
    }


    // Add listener to get the data
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.method === "sendData") {
            var toPush = request.data;
            toPush.date = parseDate(request.data.date);

            data.push(toPush);
            displayWaiting();
            update(500);

            console.log("Data received:", toPush.date, toPush.val);
        }
    });

    setupOptions();
    displayWaiting();
    update(0);
}());
