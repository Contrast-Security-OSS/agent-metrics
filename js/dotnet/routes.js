

(function($) {
      
    var app = $.sammy(function() {
    
        this.element_selector = "#page-wrapper";
        this.use(Sammy.Template, "html");

        this.get("#/", function(context) {

            var model = controllers.homepage.getModel();
            context.render("homepage.template.html", model,
            function(view) {
               $(app.element_selector).html(view);
               controllers.homepage.render(model);
            });
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
		timeline = response;
		
        app.run("#/");
	});

      
})(jQuery);