


(function($) {

    var appList;

    var app = $.sammy(function() {
    
        this.element_selector = "#page-wrapper";
        this.use(Sammy.Template, "html");

        this.get('#/dotnet', function() {
            // the template is rendered in the current context.
            this.apps = ["what"];
            // partial calls template() because of the file extension
            this.partial('appList.template.html');
          });
        
        this.get("#/selectApp/:appName", function(context) {
            let appName = this.params["appName"];
            timeline = R.filter(d => d.appName == appName)(fullTimeline);
            $("#report-name").text(".NET Agent Metrics Report - " + appName);
            
            $("#grpAppLinks>a").toggleClass("active", false);
            $("#lnkApp_" + appName).toggleClass("active", true);
            
            this.redirect("#/");
        });

        this.get("#/selectAllApps", function(context) {
            timeline = fullTimeline;
            $("#report-name").text(".NET Agent Metrics Report - All Apps");
            $("#grpAppLinks>a").toggleClass("active", false);
            
            this.redirect("#/");
        });

        this.get("#/", function(context) {

            var model = controllers.homepage.getModel();
            context.render("homepage.template.html", model,
                function(view) {
                    $(app.element_selector).html(view);
                    controllers.homepage.render(model);
                }
            );
            
            if(!appList) {
                
                var distinctApps = R.pipe(R.filter(d => d.category == "RequestAnalysis"), R.pluck('appName'), R.uniq, R.sortBy(t=>t));
            
                appList = { apps: distinctApps(fullTimeline) };
                context.render("appList.template.html", appList,
                    function(view) {
                        $("#app-list").html(view);
                        setupAppList();
                    }
                );
            }
        });

        this.get("#/urls", function(context) {
            context.app.swap('');
            var model = controllers.urls.getModel();
            context.render("urls.template.html", model,
                function(view) {
                $(app.element_selector).html(view);
                controllers.urls.render(model);
                });
        });

        this.get("#/findings", function(context) {
            var model = controllers.findings.getModel();
            context.render("findings.template.html", model,
                function(view) {
                $(app.element_selector).html(view);
                controllers.findings.render(model);
                });
        });

        this.get("#/pipeMessages", function(context) {
            var model = controllers.pipeMessages.getModel();
            context.render("pipeMessages.template.html", model,
                function(view) {
                $(app.element_selector).html(view);
                controllers.pipeMessages.render(model);
                });
        });

        this.get("#/teamserver", function(context) {
            var model = controllers.teamserver.getModel();
            context.render("teamserver.template.html", model,
                function(view) {
                $(app.element_selector).html(view);
                controllers.teamserver.render(model);
                });
        });

        this.get("#/errors", function(context) {
            $.getJSON('/data/errors.json', function(data) {
                var model = controllers.errors.getModel(data);
                context.render("errors.template.html", model,
                    function(view) {
                        $(app.element_selector).html(view);
                        controllers.errors.render(model);
                    });
            });
            
        });
        

    });

    
    $.getJSON('/data/timeline-dotnet.json', function(response) {
		$.unblockUI();
        fullTimeline = response;
		timeline = response;
		
        app.run("#/");
	});


    var setupAppList = function() {

        $("input:radio[name='selectedApp']").change(
            function() {
                if(this.checked) {                    
                    timeline = R.filter(d => d.appName == this.value)(fullTimeline);

                    app.refresh();
                }
            }
        );

}

      
})(jQuery);


