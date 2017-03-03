function bucketizeErrors() {
	for(var i=0;i<errors.length;i++) {
		var error = errors[i]
		errorTableRows.push(new Array(error.timeStr, error.level, error.class, error.thread, error.message))
	}
}

function changeErrorsView() {
	$.ajax({
        url : 'errors.html',
        type: 'GET',
        success: function(data){
            $('#page-wrapper').html(data);
            loadErrorsTable();
        }
    });
}

function loadErrorsTable() {
	var table = $("#errors-table").DataTable({
		data: errorTableRows,
		columns: [
		          { title: "Time" },
		          { title: "Level" },
		          { title: "Class" },
		          { title: "Thread", width: 5 },
		          { title: "Message" },
		         ],
        responsive: true,
        "createdRow": function ( row, data, index ) {
            if (errors[index].stacktrace != "") {
                var td = $(row).children(":first-child")
                td.addClass("has-stacktrace")
                td.html("<i class='fa fa-plus-square-o fa-fw'></i>" + td.html());
            }
        }
    });
	
	$('#errors-table tbody').on('click', 'td.has-stacktrace', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
 
        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
        	var error = errors[row.index()]
            row.child(formatError(error)).show();
            tr.addClass('shown');
        }
    } );
}

function formatError (error) {
	var str = "<div class='stacktrace-details'>"
	str += "<p>" + error.message + "</p><p>"
	str += error.stacktrace.join("<br/>")
	str += "</p></div>"
	return str
}