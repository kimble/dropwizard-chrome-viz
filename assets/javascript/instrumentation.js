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

function translateByXAndY(x, y) {
    return "translate(" + x + "," + y + ")";
}


var run = (function(uri) {
    "use strict";


    var scene = d3.select("#scene");

    var visualizeJvmHeap = jvmMemoryPoolVisualizer(scene, { x: 80, y: 50} );
    var sumJvmHeap = jvmMemorySummary(scene, { x: 280, y: 50 });





    function dataSink(data) {
        console.log(data);

        visualizeJvmHeap(data);
        sumJvmHeap(data);
    }


    function requestor() {
        d3.json(uri, dataSink);
    }



    return requestor;
})("http://172.17.0.78:8080/admin/metrics");




setTimeout(run, 0);
setInterval(run, 5 * 1000);