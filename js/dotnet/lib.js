
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