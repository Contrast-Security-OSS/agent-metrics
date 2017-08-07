controllers.homepage = {
    getModel: function () {
        var selectUrls = R.filter(d => d.category == "RequestAnalysis");
        var selectPipeMessages = R.filter(d => d.category == "SensorMsgPipe");
        var selectTraces = R.filter(d => d.category == "TraceFate");
        var selectTeamServerMessages = R.filter(d => d.category == "TeamServerMessage");

        var orderByTime = R.sortBy(R.prop("time"));

        var startTotal = function () { return { "total": 0 } };
        var countTotal = (bucket, data) => bucket.total++;

        var startFinding = function () {
            return {
                "NewFinding": 0,
                "LocalCacheHit": 0,
                "LateStageSuppress": 0,
                "Preflighted": 0
            }
        };

        var startPipeMessage = function () {
            return {
                "LoadLastServerConfig": 0,
                "StartServer": 0,
                "RefreshGeneratedRules": 0,
                "CreateApplication": 0,
                "SendAppUpdate": 0,
                "RecordAppInfo": 0,
                "RecordServerInfo":0,
                "RecordRequest": 0,
                "AccumulateRule": 0,
                "SendFindings": 0,
                "SendAppActivity": 0,
                "Other": 0
            }
        }

        var startTsMessage = function () {
            return {
                "ServerStart": 0,
                "ServerActivity": 0,
                "ApplicationCreate": 0,
                "ApplicationActivity": 0,
                "ApplicationInfo": 0,
                "Traces": 0,
                "Other": 0
            }
        }
        var countBySubcategory = function (bucket, data) {
            if (bucket[data.subcategory] != undefined)
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
        let traceStats = calcRateStats(traceData);
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
    },

    render: function(model) {
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
        var keys = ['LoadLastServerConfig', "StartServer", "RefreshGeneratedRules", "CreateApplication","SendAppUpdate",
            "RecordAppInfo","RecordServerInfo","RecordRequest","AccumulateRule","SendFindings","SendAppActivity", "Other"];
        Morris.Area({
            element: 'pipe-chart',
            data: model.pipeMessages,
            xkey: 'time',
            ykeys: keys,
            labels: keys,
            pointSize: 2,
            hideHover: 'auto',
            resize: true
        });
        var tsKeys = ["ServerStart","ServerActivity","ApplicationCreate","ApplicationActivity","ApplicationInfo","Traces", "Other"]
        Morris.Area({
            element: 'tsMessages-chart',
            data: model.tsMessages,
            xkey: 'time',
            ykeys: tsKeys,
            labels: tsKeys,
            pointSize: 2,
            hideHover: 'auto',
            resize: true
        });
    }
}

function calcRateStats(data) {
    let total = addCommas(data.length);
    let rate = (data.length < 2) ? 0 : round((data.length * 1000) / (data[data.length - 1].time - data[0].time)) + "/second";
    return {
        total: total,
        rate: rate
    }
}
