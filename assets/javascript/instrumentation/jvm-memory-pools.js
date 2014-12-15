window.jvmMemoryPoolVisualizer = function(d3scene, pos) {



    function makeGauges(gaugeData) {
        var gauges = [];

        Object.keys(gaugeData).forEach(function(name) {
            var match = name.match(/^jvm.memory.pools.(.*).usage/);

            if (match != null) {
                gauges.push({
                    name: match[1].replace(/-/g, ' ').replace(/PS /g, ''),
                    value: gaugeData[name].value,
                    endAngle: gaugeData[name].value * 2 * Math.PI
                });
            }
        });

        return gauges;
    }

    var barWidth = 120;
    var poolHeight = 50;


    function draw(memoryPoolGauges) {
        console.log("Memory pool gauges: ", memoryPoolGauges);

        var memoryPool = d3scene.selectAll('.memory-pool-gauge')
            .data(memoryPoolGauges, extractAttribute("name"));


        // Enter
        var enterMemoryPool = memoryPool.enter()
            .append("g")
            .attr("class", "memory-pool-gauge")
            .attr("transform", function(d, i) {
                return translateByXAndY(pos.x, pos.y + (poolHeight * i));
            });

        var chartGroup = enterMemoryPool.append("g")
            .attr("transform", function() {
                return translateByXAndY(0, (poolHeight / 2)) + "rotate(0)";
            });


        chartGroup.append("rect")
            .attr("width", barWidth)
            .attr("height", 5)
            .style("fill", "#f5f5f5");

        var foreground = chartGroup.append("rect")
            .attr("class", "rect-foreground")
            .attr("width", 0)
            .attr("height", "5px")
            .style("fill", "orange");

        chartGroup.append("text")
            .style("font-size", "14pt")
            .style("text-anchor", "middle")
            .style("fill", "#555")
            .attr("transform", function() {
                return translateByXAndY(barWidth / 2, -10);
            })
            .text(extractAttribute("name"));

        memoryPool.select(".rect-foreground")
            .attr("x", function(d) {
                return (1 - d.value) * (barWidth / 2);
            })
            .attr("width", function(d) {
                return barWidth * d.value;
            });

    }


    return function(metricsData) {
        var memoryPoolGauges = makeGauges(metricsData.gauges);
        draw(memoryPoolGauges);
    };
};