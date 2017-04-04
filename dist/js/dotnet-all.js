/*!
 * Start Bootstrap - SB Admin 2 v3.3.7+1 (http://startbootstrap.com/template-overviews/sb-admin-2)
 * Copyright 2013-2017 Start Bootstrap
 * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap/blob/gh-pages/LICENSE)
 */
timeline = [];
controllers = {};

controllers.errors = {

    getModel: function (data) {
        let errorTableRows = [];
        for (var i = 0; i < data.length; i++) {
            var error = data[i]
            let errorMessage = error.message + " [" + error.fileName + "]";
            errorTableRows.push(new Array(new Date(error.time), error.logLevel, error.threadId, errorMessage));
        }

        return {
            errors: data,
            errorsTable: errorTableRows
        }
    },

    render: function (model) {
        let table = $("#errors-table")
            .DataTable({
                data: model.errorsTable,
                columns: [
                    { title: "DateTime" },
                    { title: "Level" },
                    { title: "Thread ID" },
                    { title: "Message" }
                ],
                responsive: false
            });
    }
}


controllers.findings = {

    getModel: function () {

        var selectTraces = R.filter(d => d.category == "TraceFate");
        var orderByTime = R.sortBy(R.prop("time"));

        var startFinding = function () {
            return {
                "NewFinding": 0,
                "LocalCacheHit": 0,
                "LateStageSuppress": 0,
                "Preflighted": 0
            }
        };

        var countBySubcategory = function (bucket, data) {
            if (bucket[data.subcategory] != undefined)
                bucket[data.subcategory]++;
            else
                bucket["Other"]++;
        }

        let traceData = selectTraces(timeline);
        let traceStats = calcRateStats(traceData);
        let getTraceChart = R.pipe(() => traceData, orderByTime, bucketizeByDate(100, startFinding, countBySubcategory));

        let tracesByRule = R.pipe(R.groupBy(t => t.properties["ruleId"]), R.map(t => t.length));
        let tracesByFate = R.pipe(R.groupBy(t => t.subcategory), R.map(t => t.length));

        let ruleChartData = new Array();

        let mapToLabelValue = (value, key) => ruleChartData.push({ "label": key, "value": value });
        R.forEachObjIndexed(mapToLabelValue, tracesByRule(traceData));


        let fateChartData = new Array();
        R.forEachObjIndexed((value, key) => fateChartData.push({ "label": key, "value": value }), tracesByFate(traceData));

        let traceTable = new Array();
        for (var i = 0; i < traceData.length; ++i) {
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
    },
    
    render: function (model) {
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
}

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
                "NewRequestEndUrl": 0,
                "NewFinding": 0,
                "ModuleResponseMessage": 0,
                "NewResponseHeader": 0,
                "Other": 0
            }
        }

        var startTsMessage = function () {
            return {
                "VersionRequest": 0,
                "ServerRequest": 0,
                "AppCreateRequest": 0,
                "ServerActivityRequest": 0,
                "AppActivityRequest": 0,
                "TraceRequest": 0,
                "PreFlightRequest": 0,
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
}

function calcRateStats(data) {
    let total = addCommas(data.length);
    let rate = round((data.length * 1000) / (data[data.length - 1].time - data[0].time)) + "/second";
    return {
        total: total,
        rate: rate
    }
}


function round(n) {
	return +(Math.round(n + "e+" + 2)  + "e-" + 2)
}

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function fmtDate(s) {
	return s.replace(/GMT\-\d{4} /,'').replace('(','').replace(')','');
}


function bucketizeByDate(bucketCount, createFn, accumFn) {
    return function(data) {

        // calculate the time between data points
        var first = data[0];
        var last = data[data.length - 1];
        var elapsed = last.time - first.time;
        var stepSize = elapsed / bucketCount
        
        // temp variables when looking at each bucket
        var bucketTotal = 0;
        
        // all the data is bucketed into this
        var buckets = Array(bucketCount)
        var bucketIndex = 0;
        
        // initialize empty buckets
        for(var i=0;i<bucketCount;i++) {
            buckets[i] = createFn();
            buckets[i].time = first.time + (stepSize * i);
        }
        
        var bucketMax = first.time + stepSize;
        for(var i=0; i<data.length; i++) {
            var entry = data[i]
            while(entry.time > bucketMax) {
                bucketIndex++;
                bucketMax += stepSize;
            }
            if(bucketIndex == bucketCount - 1) {
                bucketMax = Number.MAX_SAFE_INTEGER;
            }
            accumFn(buckets[bucketIndex], entry);
        }

        return buckets;
    }
}

controllers.pipeMessages = {

    getModel: function() {
        let selectPipeMessages = R.filter(d => d.category == "SensorMsgPipe");
        let orderByTime = R.sortBy(R.prop("time"));

        let startPipeMessage = function () {
            return {
                "NewRequestEndUrl": 0,
                "NewFinding": 0,
                "ModuleResponseMessage": 0,
                "NewResponseHeader": 0,
                "Other": 0
            }
        }
        let countBySubcategory = function (bucket, data) {
            if (bucket[data.subcategory] != undefined)
                bucket[data.subcategory]++;
            else
                bucket["Other"]++;
        }


        let startUtilizationMessage = function () {
            return {
                "bytes": 0
            }
        }

        let countUtilization = function (bucket, data) {
            bucket["bytes"] += parseInt(data.properties["len"]);
        }

        let pipeData = selectPipeMessages(timeline);
        let pipeStats = calcRateStats(pipeData);
        let getPipeChart = R.pipe(() => pipeData, orderByTime, bucketizeByDate(100, startPipeMessage, countBySubcategory));

        let getUtilizationChart = R.pipe(() => pipeData, orderByTime, bucketizeByDate(80, startUtilizationMessage, countUtilization));

        var first = pipeData[0];
        var last = pipeData[pipeData.length - 1];
        var elapsed = last.time - first.time;
        var stepSize = elapsed / 80 / 1000;
        console.log(first, last, elapsed, stepSize);
        
        let fixedUtilizationData = getUtilizationChart().map(
            function (r) {
                return {
                    "time": r.time,
                    "bytes": parseInt(r.bytes = r.bytes / stepSize)
                }
            });

        console.log("fixed utilization", fixedUtilizationData);



        let pipeTable = new Array();
        for (var i = 0; i < pipeData.length; ++i) {
            let t = pipeData[i];
            pipeTable.push(new Array(new Date(t.time), t.appName, t.subcategory, t.properties["len"]));
        }
        return {
            pipeTable: pipeTable,
            pipeChart: getPipeChart(),
            utilizationChart: fixedUtilizationData,
            pipeStats: pipeStats
        };
    },

    render: function (model) {

        Morris.Area({
            element: 'pipe-chart',
            data: model.pipeChart,
            xkey: 'time',
            ykeys: ['NewRequestEndUrl', "NewFinding", "ModuleResponseMessage", "NewResponseHeader", "Other"],
            labels: ['NewRequestEndUrl', "NewFinding", "ModuleResponseMessage", "NewResponseHeader", "Other"],
            pointSize: 2,
            hideHover: 'auto',
            resize: true
        });

        Morris.Line({
            element: 'utilization-chart',
            data: model.utilizationChart,
            xkey: 'time',
            ykeys: ['bytes'],
            labels: ['Bytes/second'],
            pointSize: 2,
            hideHover: 'auto',
            resize: true
        });

        $("#pipe-table").DataTable({
                data: model.pipeTable,
                columns: [
                    { title: "Time" },
                    { title: "App" },
                    { title: "Type" },
                    { title: "Length" }
                ],
                responsive: false
            });
    }
}



function blah() {}



(function($) {
      
    var app = $.sammy(function() {
    
        this.element_selector = "#page-wrapper";
        this.use(Sammy.Template, "html");

        this.get("#/", function(context) {

            var model = controllers.homepage.getModel();
            context.render("homepage.template.html", model,
            function(view) {
               $(app.element_selector).html(view);
               controllers.homepage.render(model);
            });
        });

        this.get("#/urls", function(context) {
            context.app.swap('');
            var model = controllers.urls.getModel();
            context.render("urls.template.html", model,
                function(view) {
                $(app.element_selector).html(view);
                controllers.urls.render(model);
                });
        });

        this.get("#/findings", function(context) {
            var model = controllers.findings.getModel();
            context.render("findings.template.html", model,
                function(view) {
                $(app.element_selector).html(view);
                controllers.findings.render(model);
                });
        });

        this.get("#/pipeMessages", function(context) {
            var model = controllers.pipeMessages.getModel();
            context.render("pipeMessages.template.html", model,
                function(view) {
                $(app.element_selector).html(view);
                controllers.pipeMessages.render(model);
                });
        });

        this.get("#/teamserver", function(context) {
            var model = controllers.teamserver.getModel();
            context.render("teamserver.template.html", model,
                function(view) {
                $(app.element_selector).html(view);
                controllers.teamserver.render(model);
                });
        });

        this.get("#/errors", function(context) {
            $.getJSON('/data/errors.json', function(data) {
                var model = controllers.errors.getModel(data);
                context.render("errors.template.html", model,
                    function(view) {
                        $(app.element_selector).html(view);
                        controllers.errors.render(model);
                    });
            });
            
        });
        

    });

    
    $.getJSON('/data/timeline-dotnet.json', function(response) {
		$.unblockUI();
		timeline = response;
		
        app.run("#/");
	});

      
})(jQuery);
controllers.teamserver = {

    getModel: function () {
        var selectUrls = R.filter(d => d.category == "TeamServerMessage");
        var orderByTime = R.sortBy(R.prop("time"));

        var startTotal = function () { return { "total": 0 } };
        var countTotal = (bucket, data) => bucket.total++;

        let tsData = selectUrls(timeline);
        let tsStats = calcRateStats(tsData);
        let getTsChart = R.pipe(() => tsData, orderByTime, bucketizeByDate(100, startTotal, countTotal));

        let tsTable = new Array();
        for (var i = 0; i < tsData.length; ++i) {
            let t = tsData[i];
            tsTable.push(new Array(new Date(t.time), t.appName, t.subcategory, t.properties["time"] || "0"));
        }

        console.log(tsData);

        return {
            tsStats: tsStats,
            tsChart: getTsChart(),
            tsTable: tsTable
        };
    },
    render: function (model) {
        Morris.Area({
            element: 'ts-chart',
            data: model.tsChart,
            xkey: 'time',
            ykeys: ["total"],
            labels: ['URLs Hit'],
            pointSize: 2,
            hideHover: 'auto',
            resize: true
        });

        $("#ts-table").DataTable({
            data: model.tsTable,
            columns: [
                { title: "Time" },
                { title: "App" },
                { title: "Type" },
                { title: "Duration (ms)" }
            ],
            responsive: false
        });
    }
}
controllers.urls = {

    getModel: function () {
        var selectUrls = R.filter(d => d.category == "RequestAnalysis");
        var orderByTime = R.sortBy(R.prop("time"));

        var startTotal = function () { return { "total": 0 } };
        var countTotal = (bucket, data) => bucket.total++;

        let urlData = selectUrls(timeline);
        let urlStats = calcRateStats(urlData);
        let getUrlChart = R.pipe(() => urlData, orderByTime, bucketizeByDate(100, startTotal, countTotal));

        let urlTable = new Array();
        for (var i = 0; i < urlData.length; ++i) {
            let t = urlData[i];
            urlTable.push(new Array(new Date(t.time), t.appName, t.subcategory, t.properties["url"]));
        }
        console.log(urlData);

        return {
            urlStats: urlStats,
            urlChart: getUrlChart(),
            urlTable: urlTable
        };
    },

    render: function (model) {
        Morris.Area({
            element: 'url-chart',
            data: model.urlChart,
            xkey: 'time',
            ykeys: ["total"],
            labels: ['URLs Hit'],
            pointSize: 2,
            hideHover: 'auto',
            resize: true
        });

        $("#url-table").DataTable({
            data: model.urlTable,
            columns: [
                { title: "Time" },
                { title: "App" },
                { title: "Result" },
                { title: "Url"}                
            ],
            responsive: false
        });
    }
}