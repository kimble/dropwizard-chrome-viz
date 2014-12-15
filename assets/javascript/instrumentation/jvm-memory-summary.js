window.jvmMemorySummary = function(d3scene, pos) {

    function bytesToSize(bytes) {
        if(bytes == 0) return '0 Byte';
        var k = 1000;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    }

    function createDataSummary(gaugeData) {
        var heapUsed = gaugeData['jvm.memory.heap.used'].value;
        var heapMax = gaugeData['jvm.memory.heap.max'].value;

        var nonHeapUsed = gaugeData['jvm.memory.non-heap.used'].value;
        var nonHeapMax = gaugeData['jvm.memory.non-heap.max'].value;

        return [
            {
                name: 'Heap',
                used: heapUsed,
                max: heapMax,
                textPercentage: Math.round((heapUsed / heapMax) * 100) + "%",
                textUsage: bytesToSize(heapUsed) + " of " + bytesToSize(heapMax),
                endAngle: (heapUsed / heapMax) * 2 * Math.PI
            },
            {
                name: 'Non-heap',
                used: nonHeapUsed,
                max: nonHeapMax,
                textPercentage: Math.round((nonHeapUsed / nonHeapMax) * 100) + "%",
                textUsage: bytesToSize(nonHeapUsed) + " of " + bytesToSize(nonHeapMax),
                endAngle: (nonHeapUsed / nonHeapMax) * 2 * Math.PI
            }
        ]
    }

    var width = 80,
        τ = 2 * Math.PI; // http://tauday.com/tau-manifesto


    var arc = d3.svg.arc()
        .innerRadius((width / 2) - 7)
        .outerRadius(width / 2)
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





    function draw(data) {
        console.log("Summary: ", data);


        // Draw help
        var helpGroupEntering = d3scene.selectAll('.memory-usage-help')
            .data([0])
            .enter()
            .append("g")
            .attr("class", "memory-usage-help help")
            .attr("transform", translateByXAndY(pos.x + 30, pos.y - 45));


        helpGroupEntering.append("path")
            .attr("fill", "transparent")
            .attr("d", "M" + width + " 20 l10 0 l0 " + (data.length * (width+70)) + ' l-10 0');

        helpGroupEntering.append("text")
            .attr("transform", translateByXAndY(width + 20, (data.length * (width+70)) / 2) + "rotate(90)")
            .attr("text-anchor", "middle")
            .text("Memory usage summary");





        var memoryTypeSummary = d3scene.selectAll('.memory-type-summary')
            .data(data, extractAttribute("name"));


        // Enter
        var enteringApplication = memoryTypeSummary.enter()
            .append("g")
                .attr("class", "memory-type-summary")
                .attr("transform", function(d, i) {
                    return translateByXAndY(pos.x, pos.y + ((width + 70) * i));
                });

        enteringApplication.append("text")
            .attr("class", "header")
            .attr("transform", translateByXAndY(width / 2, 0))
            .text(extractAttribute("name"));

        enteringApplication.append("text")
            .attr("class", "memory-type-usage")
            .attr("transform", translateByXAndY(width / 2, 20))
            .text(extractAttribute("textUsage"));

        enteringApplication.append("text")
            .attr("class", "memory-percentage")
            .attr("text-anchor", "middle")
            .attr("transform", translateByXAndY(width / 2, 35 + (width / 2)));

        enteringApplication.append("path")
            .attr("transform", translateByXAndY(width / 2, 30 + (width / 2)))
            .datum({ endAngle: τ })
            .style("fill", "#f5f5f5")
            .attr("d", arc);

        var foreground = enteringApplication.append("path")
            .attr("transform", translateByXAndY(width / 2, 30 + (width / 2)))
            .attr("class", "foreground")
            .style("fill", "orange")
            .attr("d", arc);



        // Enter + update
        memoryTypeSummary.select(".foreground")
            .attr("d", arc);

        memoryTypeSummary.select(".memory-percentage")
            .text(extractAttribute("textPercentage"))

    }


    return function(metricsData) {
        var memoryPoolGauges = createDataSummary(metricsData.gauges);
        draw(memoryPoolGauges);
    };
};