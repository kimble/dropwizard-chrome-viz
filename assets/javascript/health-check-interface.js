(function() {
    "use strict";


    var noResponseTimeout = 5 * 1000;


    function extractAttribute(name) {
        return function (obj) {
            return obj[name];
        };
    }

    function not(f) {
        return function (obj) {
            return !f(obj);
        }
    }


    function createRequestor(name, uri, jsonSink) {
        jsonSink({
            name: name,
            responsive: false,
            health: []
        });


        var previousHealth = [];

        var sendNoResponseMessage = function() {
            jsonSink({
                name: name,
                responsive: false,
                health: previousHealth
            });
        };

        return function() {
            var timeout = setTimeout(sendNoResponseMessage, noResponseTimeout);

            var wrapper = function (healthJson) {
                clearTimeout(timeout);

                previousHealth =  Object.keys(healthJson).map(function(check) {
                    return {
                        name: check,
                        healthy: healthJson[check].healthy,
                        message: healthJson[check].message
                    }
                });

                jsonSink({
                    name: name,
                    responsive: true,
                    health: previousHealth
                });
            };

            var errorWrapper = function(jqxhr) {
                if (jqxhr.status == 500) {
                    wrapper(jqxhr.responseJSON);
                }
                else {
                    sendNoResponseMessage();
                }
            };

            $.get(uri)
                .done(wrapper)
                .fail(errorWrapper);
        };
    }




    function createD3() {
        var scene = d3.select("#scene");

        var width = window.innerWidth;
        var height = window.innerHeight - 95;

        var columnWidth = 280;
        var columnHeight = 50;
        var columnSpace = 20;

        var svg = scene.attr({ width: width, height: height })
            .append("g")
                .attr("transform", "translate(30, 50)");

        svg.append('filter')
            .attr("id", "blur")
            .append("feGaussianBlur")
                .attr("stdDeviation", "1");

        var applicationGroup = svg.append("g");


        function translateByXAndY(x, y) {
            return "translate(" + x + "," + y + ")";
        }



        function translate(somethingWithCoordinates) {
            return "translate(" + somethingWithCoordinates.x + "," + somethingWithCoordinates.y + ")";
        }

        function normalizeHyphenString(str) {
            return (str.substring(0, 1).toUpperCase() + str.substring(1)).replace(/\-/g, ' ');
        }

        function ellipses(str, max) {
            if (str == undefined || str.length == 0) {
                return "No message";
            }
            else if (str.length > max) {
                return str.substring(0, max) + "...";
            }
            else {
                return str;
            }
        }


        return function(state) {

            var sortedByName = d3.values(state).sort(function(a, b) {
                return d3.ascending(a.name, b.name);
            });

            var application = applicationGroup.selectAll("g.application")
                .data(sortedByName, extractAttribute("name"));

            // Enter
            var enteringApplication = application.enter()
                .append("g")
                    .attr("class", "application")
                    .attr("transform", function(d, i) { return translateByXAndY(i * (columnWidth + columnSpace), 0 ); });

            enteringApplication.append("text")
                .attr("x", 20)
                .attr("y", 0)
                .attr("class", "application-header")
                .text(extractAttribute("name"));

            enteringApplication.append("path")
                .classed("underlined", true)
                .attr("d", "M5 10 l 2 5 l "+ (columnWidth-30) + " -6");


            // Enter + update of application
            application.classed("unresponsive", not(extractAttribute("responsive")));

            application.transition()
                .duration(1500)
                .delay(function(d, i) { return i * 50; })
                .ease('elastic')
                .attr('transform', function(d, i) {
                    return translateByXAndY(i * (columnWidth + columnSpace), 0)
                });

            // Remove application
            application.exit()
                .transition()
                .duration(400)
                .ease('sin')
                .attr('transform', function(d, i) {
                    return "translate("+ (i * (columnWidth + columnSpace)) +", 0)";
                })
                .remove();







            var healthCheck = application.selectAll(".health-check")
                .data(function(d) { return d.health; }, extractAttribute("name"));


            // Enter health check
            var healthCheckEntering = healthCheck.enter()
                .append("g")
                .attr("class", "health-check");

            healthCheckEntering.append("path")
                .attr("class", "unhealthy-check-background")
                .attr("fill", "rgb(252, 119, 30)")
                .attr("d", "M -7 -17 l 3 45 l " + columnWidth + " -3 l -3 -45");

            healthCheckEntering.append("text")
                .attr("class", "font-awesome health-indicator-icon")
                .text('\uf057');

            healthCheckEntering.append("text")
                .attr("transform", "translate(30, 0)")
                .text(function(d) {
                    return normalizeHyphenString(d.name);
                });

            healthCheckEntering.append("text")
                .attr("class", "message")
                .attr("transform", "translate(35, 20)");


            // Enter + update health check

            healthCheck.select('.health-indicator-icon')
                .text(function(d) {
                    return d.healthy ? '\uf13a' : '\uf057';
                })
                .transition()
                .duration(500)
                .attr("font-size", function(d) {
                    return d.healthy ? "0.8em" : "2em";
                })
                .attr("transform", function(d) {
                    return d.healthy ? "translate(10, 5)" : "translate(0, 17)";
                });

            healthCheck.select(".unhealthy-check-background")
                .transition()
                .duration(500)
                .attr("transform", function(d) {
                    return d.healthy ? "scale(0)" : "scale(1)"
                });

            healthCheck.select('.message')
                .text(function(d) {
                    return ellipses(d.message, 35);
                });

            healthCheck.classed("healthy", extractAttribute("healthy"))
                       .classed("unhealthy", not(extractAttribute("healthy")));

            healthCheck.transition()
                    .duration(500)
                    .attr("fill", function(d) {
                        return d.healthy ? "black" : "white";
                    })
                    .attr('transform', function(d, i) {
                        return translateByXAndY(0, 40 + (i * columnHeight))
                    });





            // Remove health check
            healthCheck.exit().remove();

        };
    }



    var state = { };
    var redraw = createD3();

    var poison = { };

    function initialize(name, uri) {
        var requestor = createRequestor(name,  uri, function(message) {
            state[message.name] = message;
            redraw(Object.keys(state).map(function(key) { return state[key]; }));
        });

        var timeout = setTimeout(requestor, 0);
        var interval = setInterval(requestor, 10 * 1000);

        poison[name] = function() {
            clearTimeout(timeout);
            clearInterval(interval);
            delete state[name];
        }
    }


    function addToStorage(name, uri) {
        chrome.storage.local.get({ healthchecks: {} }, function(result) {
            var settings = result.healthchecks;
            settings[name] = uri;

            chrome.storage.local.set({ healthchecks: settings }, function(e) { console.log(e); });
        });
    }

    function removeFromStorage(name) {
        chrome.storage.local.get({ healthchecks: {} }, function(result) {
            var settings = result.healthchecks;
            delete settings[name];

            chrome.storage.local.set({ healthchecks: settings });
        });
    }

    function initializeFromStorage() {
        chrome.storage.local.get({ healthchecks: {} }, function(result) {
            Object.keys(result.healthchecks).reverse().forEach(function(name, index) {
                setTimeout(function() {
                    initialize(name, result.healthchecks[name]);
                }, index * 800);
            });
        });
    }





    $("#submitHealthCheck").mouseup(function () {
        $("#addSiteModal").modal("hide");

        var uri = $("#uri").val();
        var name = $("#name").val();

        initialize(name, uri);
        addToStorage(name, uri);
    });

    $('body').on("dblclick", ".application-header", function(event) {
        var name = event.target.innerHTML;
        poison[name]();
        removeFromStorage(name);
        redraw(Object.keys(state).map(function(key) { return state[key]; }));
    });


    initializeFromStorage();

})();
