window.jvmThreadSummary = function(d3scene, pos) {



    function createThreadData(d) {


        return {
            total: d['jvm.threads.count'].value,
            daemons: d['jvm.threads.daemon.count'].value,
            details: [
                {
                    name: 'Blocked',
                    color: '#F47418',
                    count: d['jvm.threads.blocked.count'].value
                },
                {
                    name: 'New',
                    color: '#D6D250',
                    count: d['jvm.threads.new.count'].value
                },
                {
                    name: 'Runnable',
                    color: '#22E342',
                    count: d['jvm.threads.runnable.count'].value
                },
                {
                    name: 'Terminated',
                    color: '#666',
                    count: d['jvm.threads.terminated.count'].value
                },
                {
                    name: 'Waiting',
                    color: '#D1B636',
                    count: d['jvm.threads.waiting.count'].value
                },
                {
                    name: 'Timed waiting',
                    color: '#B8D618',
                    count: d['jvm.threads.timed_waiting.count'].value
                }
            ]
        }
    }

    var width = 300;
    var maxHeight = 100;



    function draw(threadData) {
        var details = threadData.details;

        details.forEach(function(d, i) {
            details[i].x = pos.x - 30 + (width / details.length) * i;
            details[i].y = pos.y + -10;
        });




        var linearScale = d3.scale.linear()
                   .range([0, maxHeight])
                   .domain([0, threadData.total]);


        // Draw help
        var helpGroupEntering = d3scene.selectAll('.thread-help')
            .data([0])
            .enter()
            .append("g")
                .attr("class", "thread-help help")
                .attr("transform", translateByXAndY(pos.x - 32, pos.y - 10));


        helpGroupEntering.append("path")
            .attr("fill", "transparent")
            .attr("d", "M0 10 l0 -10 l" + (width + 2) + " 0 l0 10");

        helpGroupEntering.append("text")
            .attr("transform", translateByXAndY(width / 2, -10))
            .attr("text-anchor", "middle")
            .text("Jvm thread summary");



        // Enter
        var threadState = d3scene.selectAll('.thread-state-graph')
            .data(details, extractAttribute("name"));


        var enteringThreadState = threadState.enter()
            .append("g")
            .attr("class", "thread-state-graph")
            .attr("transform", function(d) {
                return translateByXAndY(d.x, d.y + 2);
            });

        enteringThreadState.append("rect")
            .attr("fill", extractAttribute("color"))
            .attr("width", (width / details.length) - 2);

        enteringThreadState.append("text")
            .attr("class", "header")
            .attr("text-anchor", "start")
            .style("font-size", "0.8em");



        // Enter + update

        threadState.select(".header")
            .attr("transform", function(d) {
                return "translate(15, " + (linearScale(d.count) + 10) + ") rotate(90)";
            })
            .classed("hidden", function(d) {
                return d.count == 0;
            })
            .text(function(d) {
                return d.name + " (" + d.count + ")"
            });

        threadState.select("rect")
            .attr("height", function(d) {
                return linearScale(d.count);
            });


    }


    return function(metricsData) {
        draw (
            createThreadData (
                metricsData.gauges
            )
        );
    };
};