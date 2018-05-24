function bucketizeClassLoads(data) {
	// temp variables when looking at each bucket
	var bucketUntouchable = 0;
	var bucketIgnored = 0;
	var bucketAnalyzedIgnored = 0;
	var bucketAnalyzedInstrumented = 0;
	var bucketBlacklisted = 0;
	
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
				'analyzed_instrumented':0,
				'blacklisted':0
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
				} else if(entry.supportingData['result'][0] == "BLACKLISTED") {
          buckets[bucketIndex].blacklisted++
          classloadingResults[4].data++;
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