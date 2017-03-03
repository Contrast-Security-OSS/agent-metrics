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