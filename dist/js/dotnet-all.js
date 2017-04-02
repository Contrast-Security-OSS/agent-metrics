/*!
 * Start Bootstrap - SB Admin 2 v3.3.7+1 (http://startbootstrap.com/template-overviews/sb-admin-2)
 * Copyright 2013-2017 Start Bootstrap
 * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap/blob/gh-pages/LICENSE)
 */

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

timeline = [];

(function($) {
      
    var app = $.sammy(function() {
    
        this.element_selector = "#page-wrapper";
        this.use(Sammy.Template, "html");

        this.get("#/", function(context) {

            var model = buildHomepageModel();
            context.render("homepage.template.html", model,
            function(view) {
               $(app.element_selector).html(view);
               renderHomepageCharts(model);
            });
        });

        this.get("#/urls", function(context) {
            context.app.swap('');
            var model = {"myvar": "something"};
            //this.partial('urls.template.html');
            context.render("urls.template.html", model,
            function(view) {
               $(app.element_selector).html(view);
            });
        });

        this.get("#/findings", function(context) {
            var model = {item: "something"};
            context.render("findings.template.html", model,
            function(view) {
               $(app.element_selector).html(view);
            });
        });

        this.get("#/pipeMessages", function(context) {
            var model = {item: "something"};
            context.render("pipeMessages.template.html", model,
            function(view) {
               $(app.element_selector).html(view);
            });
        });

        this.get("#/teamserver", function(context) {
            var model = {item: "something"};
            context.render("teamserver.template.html", model,
            function(view) {
               $(app.element_selector).html(view);
            });
        });

        this.get("#/errors", function(context) {
            var model = {item: "something"};
            context.render("errors.template.html", model,
            function(view) {
               $(app.element_selector).html(view);
            });
        });
        

    });

    
    $.getJSON('/data/timeline2.json', function(response) {
		$.unblockUI();
		timeline = response;
		
        app.run("#/");
	});

      
})(jQuery);


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

function buildHomepageModel() {

    var selectUrls = R.filter(d => d.category == "RequestAnalysis");
    var selectPipeMessages = R.filter(d => d.category == "SensorMsgPipe");
    var selectTraces = R.filter(d => d.category == "TraceFate");
    var selectTeamServerMessages = R.filter(d => d.category == "TeamServerMessage");

    var orderByTime = R.sortBy(R.prop("time")); 
	
    var startTotal = function() { return { "total": 0 }};
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

    var countTotal = (bucket, data) => bucket.total++;

    var countFindingByType = function(bucket, data) {
        bucket[data.subcategory] ++;        
    };
    var countPipeMessageByType = function(bucket, data) {
        if(data.subcategory == "NewRequestEndUrl")
            bucket["NewRequestEndUrl"]++;
        else if(data.subcategory == "NewFinding")
            bucket["NewFinding"]++;
        else if(data.subcategory == "ModuleResponseMessage")
            bucket["ModuleResponseMessage"]++;
        else if(data.subcategory == "NewResponseHeader")
            bucket["NewResponseHeader"]++;
        else
            bucket["Other"]++;
    }

    
    let urlData = selectUrls(timeline);
    let urlStats = calcRateStats(urlData);

    let pipeData = selectPipeMessages(timeline);
    let pipeStats = calcRateStats(pipeData);

    let traceData = selectTraces(timeline);
    let traceStats  = calcRateStats(traceData);

    var getUrlChart = R.pipe(() => urlData, orderByTime, bucketizeByDate(40, startTotal, countTotal));
    var getPipeChart = R.pipe(() => pipeData, orderByTime, bucketizeByDate(30, startPipeMessage, countPipeMessageByType));
    var getTraceChart = R.pipe(() => traceData, orderByTime, bucketizeByDate(40, startFinding, countFindingByType));
    
    

    return {
        urlStats: urlStats,
        urls: getUrlChart(timeline),
        pipeMessages: getPipeChart(timeline),
        pipeStats: pipeStats,
        traces: getTraceChart(timeline),
        traceStats: traceStats
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

function renderHomepageCharts(model) {
    
    Morris.Area({
        element: 'url-chart',
        data: model.urls,
        xkey: 'time',
        ykeys: ['total'],
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


}
