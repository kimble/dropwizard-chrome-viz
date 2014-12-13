window.jvmHeapVisualizer = function(d3scene) {



    function makeGauges(gaugeData) {
        var gauges = [];

        Object.keys(gaugeData).forEach(function(name) {
            var match = name.match(/^jvm.memory.pools.(.*).usage/);

            if (match != null) {
                gauges.push({
                    name: match[1].replace(/-/g, ' '),
                    value: gaugeData[name].value,
                    endAngle: gaugeData[name].value * 2 * Math.PI
                });
            }
        });

        return gauges;
    }

    var width = 60,
        height = 60,
        τ = 2 * Math.PI; // http://tauday.com/tau-manifesto


    var arc = d3.svg.arc()
        .innerRadius(40)
        .outerRadius(50)
        .startAngle(0);

    function arcTween(transition, newAngle) {
        transition.attrTween("d", function(d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle);

            return function(t) {
                d.endAngle = interpolate(t);
                return arc(d);
            };
        });
    }

    function draw(memoryPoolGauges) {
        console.log("Memory pool gauges: ", memoryPoolGauges);

        var pool = d3scene.selectAll('.memory-pool-gauge')
            .data(memoryPoolGauges, extractAttribute("name"));


        // Update
        pool.select(".foreground")
            .attr("d", arc);

        // Enter
        var enteringApplication = pool.enter()
            .append("g")
            .attr("class", "memory-pool-gauge")
            .attr("transform", function(d, i) {
                return translateByXAndY(50, 50 + (150 * i));
            });


        enteringApplication.append("text")
            .text(extractAttribute("name"));

        var chartGroup = enteringApplication.append("g")
            .attr("transform", function(d) {
                return translateByXAndY(20 + (width / 2), 30 + (height / 2));
            });

        var background = chartGroup.append("path")
            .datum({ endAngle: τ })
            .style("fill", "#ddd")
            .attr("d", arc);

        var foreground = chartGroup.append("path")
            .attr("class", "foreground")
            .style("fill", "orange")
            .attr("d", arc);

    }


    return function(metricsData) {
        var memoryPoolGauges = makeGauges(metricsData.gauges);
        draw(memoryPoolGauges);
    };
};