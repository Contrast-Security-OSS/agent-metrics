function buildErrorsModel(data) {

    let errorTableRows = [];
    for (var i = 0; i < data.length; i++) {
        var error = data[i]
        let errorMessage = error.message + " [" + error.fileName + "]";
        errorTableRows.push(new Array(new Date(error.time), error.logLevel, error.threadId, errorMessage));
    }

    return {
        errors: data,
        errorsTable: errorTableRows
    }
}

function renderErrors(model) {
    console.log("model.errorsTable", model.errorsTable);
    
    var table = $("#errors-table")
        .DataTable({
            data: model.errorsTable,
            columns: [
                { title: "DateTime" },
                { title: "Level" },
                { title: "Thread ID" },
                { title: "Message" }
            ],
            responsive: false
            // "createdRow": function (row, data, index) {
            //     if (errors[index].stacktrace != "") {
            //         var td = $(row).children(":first-child")
            //         td.addClass("has-stacktrace")
            //         td.html("<i class='fa fa-plus-square-o fa-fw'></i>" + td.html());
            //     }
            // }
        });
}