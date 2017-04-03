function buildFindingsModel() {

    var selectTraces = R.filter(d => d.category == "TraceFate");
    var orderByTime = R.sortBy(R.prop("time")); 

    var startFinding = function() { 
        return {
            "NewFinding": 0,
            "LocalCacheHit": 0,
            "LateStageSuppress": 0,
            "Preflighted" : 0
        } 
    };

    var countBySubcategory = function(bucket, data) {
        if(bucket[data.subcategory] != undefined)
            bucket[data.subcategory]++;
        else
            bucket["Other"]++;
    }

    let traceData = selectTraces(timeline);
    let traceStats  = calcRateStats(traceData);
    let getTraceChart = R.pipe(() => traceData, orderByTime, bucketizeByDate(100, startFinding, countBySubcategory));
   
    let tracesByRule = R.pipe(R.groupBy(t => t.properties["ruleId"]), R.map(t => t.length));
    let tracesByFate = R.pipe(R.groupBy(t => t.subcategory), R.map(t => t.length));

    let ruleChartData = new Array();
   
    let mapToLabelValue = (value, key) => ruleChartData.push( { "label": key, "value" : value });
    R.forEachObjIndexed(mapToLabelValue, tracesByRule(traceData));


    let fateChartData = new Array();
    R.forEachObjIndexed((value, key) => fateChartData.push( { "label": key, "value" : value }), tracesByFate(traceData));

    let traceTable = new Array();
    for(var i = 0; i<traceData.length; ++i) {
        let t = traceData[i];
        traceTable.push(new Array(new Date(t.time), t.appName, t.properties["ruleId"], t.subcategory));
    }
    console.log(traceData);
    return {
        traceTable: traceTable,
        traceChart: getTraceChart(),
        traceStats: traceStats,
        ruleBreakdown: ruleChartData,
        traceFate: fateChartData
    };
}

function renderFindings(model) {
    console.log(model);
    Morris.Area({
        element: 'trace-chart',
        data: model.traceChart,
        xkey: 'time',
        ykeys: ['NewFinding', 'LocalCacheHit', 'LateStageSuppress', 'Preflighted'],
        labels: ['New', 'Local Cache', 'Late Stage Suppress', 'Preflighted'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });

    Morris.Donut({
        element: 'trace-fate-chart',
        data: model.traceFate
    });

    Morris.Bar({
        element: 'trace-rule-breakdown',
        data: model.ruleBreakdown,
        xkey: 'label',
        ykeys: ['value'],
        labels: ['Num Findings']
    });

    $("#traces-table")
        .DataTable({
            data: model.traceTable,
            columns: [
                { title: "Time" },
                { title: "App" },
                { title: "Type" },
                { title: "Result" }
            ],
            responsive: false
        });

}