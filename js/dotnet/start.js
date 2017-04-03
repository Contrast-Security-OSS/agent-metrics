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
               renderHomepage(model);
            });
        });

        this.get("#/urls", function(context) {
            context.app.swap('');
            var model = {"myvar": "something"};
            context.render("urls.template.html", model,
            function(view) {
               $(app.element_selector).html(view);
            });
        });

        this.get("#/findings", function(context) {
            var model = buildFindingsModel();
            context.render("findings.template.html", model,
            function(view) {
               $(app.element_selector).html(view);
               renderFindings(model);
            });
        });

        this.get("#/pipeMessages", function(context) {
            var model = buildPipeMessageModel();
            context.render("pipeMessages.template.html", model,
            function(view) {
               $(app.element_selector).html(view);
               renderPipeMessages(model);
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
            $.getJSON('/data/errors.json', function(data) {
                var model = buildErrorsModel(data);
                context.render("errors.template.html", model,
                function(view) {
                    $(app.element_selector).html(view);
                    renderErrors(model);
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
