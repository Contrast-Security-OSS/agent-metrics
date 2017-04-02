/*!
 * Start Bootstrap - SB Admin 2 v3.3.7+1 (http://startbootstrap.com/template-overviews/sb-admin-2)
 * Copyright 2013-2017 Start Bootstrap
 * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap/blob/gh-pages/LICENSE)
 */
function bucketizeClassLoads(data) {
	// temp variables when looking at each bucket
	var bucketUntouchable = 0;
	var bucketIgnored = 0;
	var bucketAnalyzedIgnored = 0;
	var bucketAnalyzedInstrumented = 0;
	
	// all the data is bucketed into this
	var buckets = Array(bucketCount)
	var bucketIndex = 0;
	
	classloadingAdapters = {}
	classloadTableRows.length = 0
	classloads.length = 0
	
	// calculate the time between data points
	if(data.length != 0) {
		var first = data[0];
		var last = data[data.length - 1];
		var elapsed = last.time - first.time;
		var stepSize = elapsed / bucketCount
		
		var totalClassloads = 0;
		
		// initialize empty buckets
		for(var i=0;i<bucketCount;i++) {
			buckets[i] = {
				'time': first.time + (stepSize * i),
				'untouchable':0,
				'ignored':0,
				'analyzed_ignored':0,
				'analyzed_instrumented':0
			}
		}
		
		var totalAnalyzed = 0;
		
		var bucketMax = first.time + stepSize;
		for(var i=0;i<data.length;i++) {
			var entry = data[i]
			while(entry.time > bucketMax) {
				bucketIndex++
				bucketMax += stepSize;
			}
			if(bucketIndex == bucketCount - 1) {
				bucketMax = Number.MAX_SAFE_INTEGER;
			}
			if(entry.category == 'ClassLoad') {
				var adaptersStr = entry.supportingData['adapters'][0]
				classloads.push(entry)
				totalClassloads++
				classloadTableRows.push([
					entry.time,
					entry.subcategory,
					entry.supportingData['result'][0],
					adaptersStr
				])
				var adapters = adaptersStr.split(",");
				for(var j=0;j<adapters.length;j++) {
					var adapter = adapters[j]
					if(adapter != "") {
						if(classloadingAdapters[adapter] === undefined) {
							classloadingAdapters[adapter] = 1
						} else {
							classloadingAdapters[adapter]++
						}
					}
				}
				if(entry.supportingData['result'][0] == "UNTOUCHABLE") {
					buckets[bucketIndex].untouchable++
					classloadingResults[0].data++;
				} else if(entry.supportingData['result'][0] == "IGNORED") {
					buckets[bucketIndex].ignored++
					classloadingResults[1].data++;
				} else if(entry.supportingData['result'][0] == "ANALYZED_IGNORED") {
					buckets[bucketIndex].analyzed_ignored++
					classloadingResults[2].data++;
					totalAnalyzed++
				} else if(entry.supportingData['result'][0] == "ANALYZED_INSTRUMENTED") {
					buckets[bucketIndex].analyzed_instrumented++
					classloadingResults[3].data++;
					totalAnalyzed++
				}
			}
		}
	}
	
	$("#total-classloads").text(addCommas(totalClassloads))
	rateOfClassloads = round((totalClassloads * 1000)/elapsed);
	$("#rate-classloads").text(addCommas(rateOfClassloads) + "/second")	
	
	// populate data table
	classloadingAdapterTableRows = Array()
	for(var adapter in classloadingAdapters) {
		var count = classloadingAdapters[adapter]
		classloadingAdapterTableRows.push([adapter,count,count/totalAnalyzed])
	}
	
	return buckets
}

function loadClassloadPieChart() {
	var plotObj = $.plot($("#classloading-pie-chart"), classloadingResults, {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: true
        }
    });
}

function loadClassloadingTable() {
	$('#classloading-adapters-table').DataTable({
		data: classloadingAdapterTableRows,
		lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
		order: [[ 2, "desc" ]],
		columns: [
		          { title: "Adapter" },
		          { title: "Uses" },
		          { title: "%" },
		         ],
        responsive: true
    });
	
	$("#classloading-table").DataTable({
		data: classloadTableRows,
		columns: [
		          { title: "Time" },
		          { title: "Class" },
		          { title: "Result" },
		          { title: "Adapters" },
		         ],
        responsive: true
    });
	
}

function changeClassloadingView() {
	$.ajax({
        url : 'classloading.html',
        type: 'GET',
        success: function(data){
            $('#page-wrapper').html(data);
            drawClassloadingOverview();
            loadClassloadPieChart();
            loadClassloadingTable();
        }
    });
}

function drawClassloadingOverview() {
	var buckets = bucketizeClassLoads(timeline);
	Morris.Area({
        element: 'classloading-chart',
        data: buckets,
        xkey: 'time',
        ykeys: ['untouchable', 'ignored', 'analyzed_ignored', 'analyzed_instrumented'],
        labels: ['Untouchable', 'Ignored', 'Analyzed (Ignored)', 'Analyzed (Instrumented)'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });
}
function bucketizeErrors() {
	for(var i=0;i<errors.length;i++) {
		var error = errors[i]
		errorTableRows.push(new Array(error.timeStr, error.level, error.class, error.thread, error.message))
	}
}

function changeErrorsView() {
	$.ajax({
        url : 'errors.html',
        type: 'GET',
        success: function(data){
            $('#page-wrapper').html(data);
            loadErrorsTable();
        }
    });
}

function loadErrorsTable() {
	var table = $("#errors-table").DataTable({
		data: errorTableRows,
		columns: [
		          { title: "Time" },
		          { title: "Level" },
		          { title: "Class" },
		          { title: "Thread", width: 5 },
		          { title: "Message" },
		         ],
        responsive: true,
        "createdRow": function ( row, data, index ) {
            if (errors[index].stacktrace != "") {
                var td = $(row).children(":first-child")
                td.addClass("has-stacktrace")
                td.html("<i class='fa fa-plus-square-o fa-fw'></i>" + td.html());
            }
        }
    });
	
	$('#errors-table tbody').on('click', 'td.has-stacktrace', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
 
        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
        	var error = errors[row.index()]
            row.child(formatError(error)).show();
            tr.addClass('shown');
        }
    } );
}

function formatError (error) {
	var str = "<div class='stacktrace-details'>"
	str += "<p>" + error.message + "</p><p>"
	str += error.stacktrace.join("<br/>")
	str += "</p></div>"
	return str
}
messageTableRows = []

urlTableRows = []
rateOfUrls = 0
totalUrls = 0;

bucketCount = 20;
timeline = []

classloads = []
classloadTableRows = []
classloadingResults = [
	{
		data:0,
		label:'Untouchable'
	},
	{
		data:0,
		label:'Ignored',
	},
	{
		data:0,
		label:'Analyzed (Ignored)',
	},
	{
		data:0,
		label:'Analyzed (Instrumented)'
	}
]
classloadingAdapters = {
		
};

classloadingAdapterTableRows = []

errors = []
errorTableRows = []

messages = []
messageTableRows = []

traces = []
traceTableRows = []

$(function() {
	
	$.blockUI(); 
	$.getJSON('/data/timeline.json', function(response) {
		$.unblockUI();
		timeline = response.data;
		drawUrlOverview();
		drawTracesOverview();
		drawMessagesOverview();
		drawTrafficOverview();
		drawClassloadingOverview();
	});
	
	$.getJSON('/data/errors.json', function(response) {
		errors = response;
		bucketizeErrors();
	});
	
	$.getJSON('/data/attributes.json', function(attrs) {
		$("#teamserver-user").text(attrs['teamServerUser'])
		$("#teamserver-url").text(attrs['teamServerUrl'])
	});
	
	$.getJSON('/data/properties.json', function(props) {
		$("#jvm-name").text(props['jvm.name'])
		$("#jvm-version").text(props['jvm.version'])
		$("#agent-version").text(props['agent.version'])
		$("#agent-build-time").text(props['agent.build.time'])
	});
	
	$.getJSON('/data/apps.json', function(apps) {
		for(var i=0;i<apps.length;i++) {
			var app = apps[i]
			$("#app-list").append($("<li class='text-muted'>" + app + "</li>"))
		}
	});
	
	$.getJSON('/data/features.json', function(features) {
		if(features != undefined && features.length > 0) {
			$("#feature-content").show();
			for(var i=0;i<features.length;i++) {
				var feature = features[i]
				$("#feature-list").append($("<li class='text-muted'>" + feature + "</li>"))
			}
			if(features.indexOf("Assess") != -1) {
				$(".assess-data").show();
			}
			if(features.indexOf("Defend") != -1) {
				$(".defend-data").show();
			}
		}
	});
	
	$.getJSON('/data/timing.json', function(timing) {
		var start = timing.logStartTime
		var end = timing.logEndTime
		var startFmt = fmtDate(new Date(start).toString())
		var endFmt = fmtDate(new Date(end).toString())
		$("#log-start").text(startFmt)
		$("#log-end").text(endFmt)
	});   
		
});

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
	return s.replace(/GMT\-\d{4} /,'').replace('(','').replace(')','')
}
function bucketizeMessages(data) {
	// calculate the time between data points
	var first = data[0];
	var last = data[data.length - 1];
	var elapsed = last.time - first.time;
	var stepSize = elapsed / bucketCount
	
	// all the data is bucketed into this
	var buckets = Array(bucketCount)
	var bucketIndex = 0;
	
	var totalMessages = 0;
	
	// initialize empty buckets
	for(var i=0;i<bucketCount;i++) {
		buckets[i] = {
			'time': first.time + (stepSize * i),
			'appupdate':0,
			'appactivity':0,
			'appcreate':0,
			'preflight':0,
			'serveractivity':0,
			'serverupdate':0,
			'securitycontrol':0,
			'startup':0,
			'trace':0
		}
	}
	
	messageTableRows.length = 0
	
	var bucketMax = first.time + stepSize;
	for(var i=0;i<data.length;i++) {
		var entry = data[i]
		while(entry.time > bucketMax) {
			bucketIndex++
			bucketMax += stepSize;
		}
		if(bucketIndex == bucketCount - 1) {
			bucketMax = Number.MAX_SAFE_INTEGER;
		}
		if(entry.category == 'HttpMessage') {
			totalMessages++
			if(entry.subcategory == "APPUPDATE") {
				buckets[bucketIndex].appupdate++
			} else if(entry.subcategory == "APPCREATE-NG") {
				buckets[bucketIndex].appcreate++
			} else if(entry.subcategory == "APPACTIVITY-NG") {
				buckets[bucketIndex].appactivity++
			} else if(entry.subcategory == "PREFLIGHT") {
				buckets[bucketIndex].preflight++
			} else if(entry.subcategory == "SERVERACTIVITY-NG") {
				buckets[bucketIndex].serveractivity++;
			} else if(entry.subcategory == "SERVERUPDATE") {
				buckets[bucketIndex].serverupdate++;
			} else if(entry.subcategory == "STARTUP") {
				buckets[bucketIndex].startup++;
			} else if(entry.subcategory == "POSSIBLESECURITYCONTROL") {
				buckets[bucketIndex].securitycontrol++
			} else if(entry.subcategory == "TRACE") {
				buckets[bucketIndex].trace++
			}
			messageTableRows.push(Array(entry.time,entry.subcategory,entry.supportingData['size'],entry.supportingData['rc'],entry.supportingData['appName']))
		}
	}
	
	$("#total-messages").text(addCommas(totalMessages))
	rateOfMessages = round((totalMessages * 1000)/elapsed);
	$("#rate-messages").text(addCommas(rateOfMessages) + "/second")	
	return buckets
}

function changeMessagesView() {
	$.ajax({
        url : 'messages.html',
        type: 'GET',
        success: function(data){
            $('#page-wrapper').html(data);
            drawMessagesOverview()
            loadMessagesTable();
        }
    });
}

function drawMessagesOverview() {
	var buckets = bucketizeMessages(timeline);
	Morris.Area({
        element: 'message-chart',
        data: buckets,
        xkey: 'time',
        ykeys: ['trace', 'appupdate', 'appcreate', 'preflight', 'appactivity', 'serveractivity', 'securitycontrol', 'serverupdate', 'startup'],
        labels: ['Trace', 'AppUpdate', 'AppCreate', 'Preflight', 'AppActivity', 'ServerActivity', 'SecurityControl', 'ServerUpdate','Startup'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });
}

function loadMessagesTable() {
	$("#messages-table").DataTable({
		data: messageTableRows,
		columns: [
		          { title: "Time" },
		          { title: "Type" },
		          { title: "Size" },
		          { title: "Status" },
		          { title: "Application" }
		         ],
        responsive: true
    });	
}
propagatorFrameTableRows = []
propagatorStackTableRows = []

function changePropagatorsView() {
	$.ajax({
        url : 'propagators.html',
        type: 'GET',
        success: function(data){
            $('#page-wrapper').html(data);
            bucketizePropagators();
        }
    });
}

function bucketizePropagators() {
	$.getJSON('/data/propagator-frames.json', function(frames) {
		propagatorFrameTableRows.length = 0
		for(var i=0;i<frames.length;i++) {
			propagatorFrameTableRows.push(Array(frames[i].frame, frames[i].count))
		}
		loadPropagatorFramesTable();
	});
	
	$.getJSON('/data/propagator-stacks.json', function(frames) {
		propagatorStackTableRows.length = 0
		for(var i=0;i<frames.length;i++) {
			propagatorStackTableRows.push(Array(frames[i].stack.join("<br/>"), frames[i].count, frames[i].type))
		}
		loadPropagatorStacksTable();
	});
}

function loadPropagatorFramesTable() {
	$('#propagator-frame-table').DataTable({
		data: propagatorFrameTableRows,
		order: [[ 1, "desc" ]],
		columns: [
		          { title: "Frame" },
		          { title: "Count" }
		         ],
        responsive: true
    });
}

function loadPropagatorStacksTable() {
	$("#propagator-stack-table").DataTable({
		data: propagatorStackTableRows,
		order: [[ 1, "desc" ]],
		columns: [
		          { title: "Stack" },
		          { title: "Count" },
		          { title: "Type" }
		         ],
        responsive: true
    });
}
$(function() {
    $('#side-menu').metisMenu();
});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
    $(window).bind("load resize", function() {
        var topOffset = 50;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    // var element = $('ul.nav a').filter(function() {
    //     return this.href == url;
    // }).addClass('active').parent().parent().addClass('in').parent();
    var element = $('ul.nav a').filter(function() {
        return this.href == url;
    }).addClass('active').parent();

    while (true) {
        if (element.is('li')) {
            element = element.parent().addClass('in').parent();
        } else {
            break;
        }
    }
});

function drawTracesOverview() {
	var buckets = bucketizeTraces(timeline);
	Morris.Area({
        element: 'trace-chart',
        data: buckets,
        xkey: 'time',
        ykeys: ['blacklisted', 'localCacheHit', 'lateStageSuppress', 'preflighted', 'newFinding'],
        labels: ['Blacklisted', 'Local Cache Hit', 'Late Stage Suppress', 'Suppressed by Preflight', 'New Finding'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });
}

function bucketizeTraces(data) {
	// calculate the time between data points
	var first = data[0];
	var last = data[data.length - 1];
	var elapsed = last.time - first.time;
	var stepSize = elapsed / bucketCount
	
	// all the data is bucketed into this
	var buckets = Array(bucketCount)
	var bucketIndex = 0;
	
	traceTableRows.length = 0
	var totalTraces = 0;
	
	// initialize empty buckets
	for(var i=0;i<bucketCount;i++) {
		buckets[i] = {
			'time': first.time + (stepSize * i),
			'blacklisted':0,
			'localCacheHit':0,
			'preflighted':0,
			'disabledByException':0,
			'lateStageSuppress':0,
			'newFinding':0
		}
	}
	
	var bucketMax = first.time + stepSize;
	for(var i=0;i<data.length;i++) {
		var entry = data[i]
		while(entry.time > bucketMax) {
			bucketIndex++
			bucketMax += stepSize;
		}
		if(bucketIndex == bucketCount - 1) {
			bucketMax = Number.MAX_SAFE_INTEGER;
		}
		if(entry.category == 'TraceFate') {
			totalTraces++
			traceTableRows.push(Array(fmtDate(new Date(entry.time).toString()), entry.supportingData['ruleId'][0], entry.subcategory))
			if(entry.subcategory == "Blacklisted") {
				buckets[bucketIndex].blacklisted++
			} else if(entry.subcategory == "LocalCacheHit") {
				buckets[bucketIndex].localCacheHit++
			} else if(entry.subcategory == "Preflighted") {
				buckets[bucketIndex].preflighted++
			} else if(entry.subcategory == "DisabledByException") {
				buckets[bucketIndex].disabledByException++
			} else if(entry.subcategory == "LateStageSuppress") {
				buckets[bucketIndex].lateStageSuppress++;
			} else if(entry.subcategory == "NewFinding") {
				buckets[bucketIndex].newFinding++
			}
		}
	}
	
	$("#total-traces").text(addCommas(totalTraces))
	rateOfTraces = round((totalTraces * 1000)/elapsed);
	$("#rate-traces").text(addCommas(rateOfTraces) + "/second")	
	return buckets
}

function changeTracesView() {
	$.ajax({
        url : 'traces.html',
        type: 'GET',
        success: function(data){
            $('#page-wrapper').html(data);
            drawTracesOverview();
            loadTracesTable();
            loadTraceRuleFateChart();
        }
    });
}

function loadTracesTable() {
	$("#traces-table").DataTable({
		data: traceTableRows,
		columns: [
		          { title: "Time" },
		          { title: "Type" },
		          { title: "Result" }
		         ],
        responsive: true
    });
}

function getFateData(traceFateBreakdown, type) {
	var data = Array()
	var i = 1
	for(var rule in traceFateBreakdown) {
		data.push(Array(i, traceFateBreakdown[rule][type]))
		i++
	}
	return data
}

function loadTraceRuleFateChart() {
	var traceFateBreakdown = {};
	for(var i=0;i<traceTableRows.length;i++) {
		var row = traceTableRows[i]
		var rule = row[1]
		var result = row[2]
		if(traceFateBreakdown[rule] == undefined) {
			traceFateBreakdown[rule] = {}
			traceFateBreakdown[rule]['Blacklisted'] = 0
			traceFateBreakdown[rule]['LocalCacheHit'] = 0
			traceFateBreakdown[rule]['Preflighted'] = 0
			traceFateBreakdown[rule]['DisabledByException'] = 0
			traceFateBreakdown[rule]['LateStageSuppress'] = 0
			traceFateBreakdown[rule]['NewFinding'] = 0
		}
		traceFateBreakdown[rule][result]++
	}
	
	var ruleLabels = Array()
	var i=1;
	for(var rule in traceFateBreakdown) {
		ruleLabels.push(Array(i++, rule))
	}
	
	var data = [
	            {label: 'Blacklisted', data: getFateData(traceFateBreakdown,'Blacklisted') },
	            {label: 'LocalCacheHit', data: getFateData(traceFateBreakdown,'LocalCacheHit') },
	            {label: 'Preflighted', data: getFateData(traceFateBreakdown,'Preflighted') },
	            {label: 'DisabledByException', data: getFateData(traceFateBreakdown,'DisabledByException') },
	            {label: 'LateStageSuppress', data: getFateData(traceFateBreakdown,'LateStageSuppress') },
	            {label: 'NewFinding', data: getFateData(traceFateBreakdown,'NewFinding') }
	        ];
	
	$("<div id='tooltip'></div>").css({
		position: "absolute",
		display: "none",
		border: "1px solid #fdd",
		padding: "2px",
		"background-color": "#fee",
		opacity: 0.80
	}).appendTo("body");

	$.plot("#trace-rule-fate-chart", data, {
		series: {
			stack: 0, 
			lines: {show: false, steps: false },
			bars: {
				show: true,
				align: 'center',
			},
		},
		xaxis: {
		    ticks: ruleLabels
		},
		grid: {
			hoverable: true
		}
	});
	$("#trace-rule-fate-chart").bind("plothover", function (event, pos, item) {
		var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";

		if (item) {
			var x = item.datapoint[0].toFixed(2),
				y = item.datapoint[1].toFixed(2);

			$("#tooltip").html(item.series.label + " " + y)
				.css({top: item.pageY+5, left: item.pageX+5})
				.fadeIn(200);
		} else {
			$("#tooltip").hide();
		}
	});
}


function bucketizeTraffic(data) {
	// calculate the time between data points
	var first = data[0];
	var last = data[data.length - 1];
	var elapsed = last.time - first.time;
	var stepSize = elapsed / bucketCount
	
	// all the data is bucketed into this
	var buckets = Array(bucketCount)
	var bucketIndex = 0;
	
	var totalTraffic = 0;
	
	// initialize empty buckets
	for(var i=0;i<bucketCount;i++) {
		buckets[i] = {
			'time': first.time + (stepSize * i),
			'traffic':0
		}
	}
	
	var bucketMax = first.time + stepSize;
	for(var i=0;i<data.length;i++) {
		var entry = data[i]
		while(entry.time > bucketMax) {
			bucketIndex++
			bucketMax += stepSize;
		}
		if(bucketIndex == bucketCount - 1) {
			bucketMax = Number.MAX_SAFE_INTEGER;
		}
		if(entry.category == 'HttpMessage') {
			var size = Number(entry.supportingData['size'][0])
			totalTraffic += size
			buckets[bucketIndex].traffic += size
		}
	}
	
	$("#total-traffic").text(addCommas(totalTraffic))
	rateOfTraffic = round((totalTraffic * 1000)/elapsed);
	$("#rate-traffic").text(addCommas(rateOfTraffic) + "/second")	
	return buckets
}

function drawTrafficOverview() {
	var buckets = bucketizeTraffic(timeline);
	Morris.Area({
        element: 'traffic-chart',
        data: buckets,
        xkey: 'time',
        ykeys: ['traffic'],
        labels: ['Traffic'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });
}

function changeTrafficView() {
	$.ajax({
        url : 'traffic.html',
        type: 'GET',
        success: function(data){
            $('#page-wrapper').html(data);
            drawTrafficOverview()
            loadTrafficTable();
        }
    });
}
function drawUrlOverview() {
	var buckets = bucketizeUrlsHit(timeline);
	Morris.Area({
        element: 'url-chart',
        data: buckets,
        xkey: 'time',
        ykeys: ['total'],
        labels: ['URLs Hit'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });
}

function bucketizeUrlsHit(data) {
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
	urlTableRows.length = 0
	
	totalUrls = 0;
	
	// initialize empty buckets
	for(var i=0;i<bucketCount;i++) {
		buckets[i] = {
			'time': first.time + (stepSize * i),
			'total':0
		}
	}
	
	var bucketMax = first.time + stepSize;
	for(var i=0;i<data.length;i++) {
		var entry = data[i]
		while(entry.time > bucketMax) {
			bucketIndex++
			bucketMax += stepSize;
		}
		if(bucketIndex == bucketCount - 1) {
			bucketMax = Number.MAX_SAFE_INTEGER;
		}
		if(entry.category == 'RequestTime') {
			totalUrls++;
			buckets[bucketIndex].total++;
			urlTableRows.push(Array(fmtDate(new Date(entry.time).toString()),entry.subcategory,"?"))
		}
	}
	
	$("#total-urls").text(addCommas(totalUrls))
	rateOfUrls = round((totalUrls * 1000)/elapsed);
	$("#rate-urls").text(addCommas(rateOfUrls) + "/second")	
	return buckets
}

function loadUrlTable() {
	$("#url-table").DataTable({
		data: urlTableRows,
		columns: [
		          { title: "Time" },
		          { title: "URL" },
		          { title: "Processing Time" }
		         ],
        responsive: true
    });
}

function changeUrlView() {
	$.ajax({
        url : 'url.html',
        type: 'GET',
        success: function(data){
            $('#page-wrapper').html(data);
            drawUrlOverview()
            loadUrlTable()
        }
    });
}