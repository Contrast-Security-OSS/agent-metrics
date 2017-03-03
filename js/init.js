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