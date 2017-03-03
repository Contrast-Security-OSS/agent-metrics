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