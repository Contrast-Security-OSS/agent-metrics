
function buildHomepageModel() {

    var selectUrls = R.filter(d => d.category == "RequestAnalysis");
    var selectPipeMessages = R.filter(d => d.category == "SensorMsgPipe");
    var selectTraces = R.filter(d => d.category == "TraceFate");
    var selectTeamServerMessages = R.filter(d => d.category == "TeamServerMessage");

    var orderByTime = R.sortBy(R.prop("time")); 
	
    var startTotal = function() { return { "total": 0 }};
    var countTotal = (bucket, data) => bucket.total++;

    var startFinding = function() { 
        return {
            "NewFinding": 0,
            "LocalCacheHit": 0,
            "LateStageSuppress": 0,
            "Preflighted" : 0
        } 
    };

    var startPipeMessage = function() {
        return {
            "NewRequestEndUrl": 0,
            "NewFinding": 0,
            "ModuleResponseMessage": 0,
            "NewResponseHeader" : 0,
            "Other": 0
        }
    }

    var startTsMessage = function() {
        return {
            "VersionRequest": 0,
            "ServerRequest": 0,
            "AppCreateRequest": 0,
            "ServerActivityRequest" : 0,
            "AppActivityRequest": 0,
            "TraceRequest": 0,
            "PreFlightRequest": 0,
            "Other" : 0
        }
    }
    var countBySubcategory = function(bucket, data) {
        if(bucket[data.subcategory] != undefined)
            bucket[data.subcategory]++;
        else
            bucket["Other"]++;
    }


    let urlData = selectUrls(timeline);
    let urlStats = calcRateStats(urlData);
    let getUrlChart = R.pipe(() => urlData, orderByTime, bucketizeByDate(40, startTotal, countTotal));

    let pipeData = selectPipeMessages(timeline);
    let pipeStats = calcRateStats(pipeData);
    let getPipeChart = R.pipe(() => pipeData, orderByTime, bucketizeByDate(30, startPipeMessage, countBySubcategory));


    let traceData = selectTraces(timeline);
    let traceStats  = calcRateStats(traceData);
    let getTraceChart = R.pipe(() => traceData, orderByTime, bucketizeByDate(40, startFinding, countBySubcategory));
   
    let tsData = selectTeamServerMessages(timeline);
    let tsStats = calcRateStats(tsData);
    let getTsChart = R.pipe(() => tsData, orderByTime, bucketizeByDate(40, startTsMessage, countBySubcategory));
    

    return {
        urlStats: urlStats,
        urls: getUrlChart(),
        pipeMessages: getPipeChart(),
        pipeStats: pipeStats,
        traces: getTraceChart(),
        traceStats: traceStats,
        tsMessages: getTsChart(),
        tsStats: tsStats
    };
}

function calcRateStats(data) {
    let total = addCommas(data.length);    
    let rate = round((data.length * 1000)/(data[data.length-1].time - data[0].time)) + "/second";
    return {
        total: total,
        rate: rate
    }
}

function renderHomepage(model) {
    
    Morris.Area({
        element: 'url-chart',
        data: model.urls,
        xkey: 'time',
        ykeys: ["total"],
        labels: ['URLs Hit'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });

    Morris.Area({
        element: 'trace-chart',
        data: model.traces,
        xkey: 'time',
        ykeys: ['NewFinding', 'LocalCacheHit', 'LateStageSuppress', 'Preflighted'],
        labels: ['New', 'Local Cache', 'Late Stage Suppress', 'Preflighted'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });

    Morris.Area({
        element: 'pipe-chart',
        data: model.pipeMessages,
        xkey: 'time',
        ykeys: ['NewRequestEndUrl', "NewFinding", "ModuleResponseMessage", "NewResponseHeader", "Other"],
        labels: ['NewRequestEndUrl', "NewFinding", "ModuleResponseMessage", "NewResponseHeader", "Other"],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });

    Morris.Area({
        element: 'tsMessages-chart',
        data: model.tsMessages,
        xkey: 'time',
        ykeys: ['VersionRequest', "ServerRequest", "AppCreateRequest", "ServerActivityRequest", "AppActivityRequest", "TraceRequest", "PreFlightRequest", "Other"],
        labels: ['VersionRequest', "ServerRequest", "AppCreateRequest", "ServerActivityRequest", "AppActivityRequest", "TraceRequest", "PreFlightRequest", "Other"],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });

}