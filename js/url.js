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