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

