controllers.errors = {

    getModel: function (data) {
        let errorTableRows = [];
        for (var i = 0; i < data.length; i++) {
            var error = data[i]
            let errorMessage = error.message + " [" + error.fileName + "]";
            let date = moment(error.time).format("MMM Do, h:mm:ss a");
            errorTableRows.push(new Array(date, error.logLevel, error.threadId, errorMessage));
        }

        return {
            errors: data,
            errorsTable: errorTableRows
        }
    },

    render: function (model) {
        let table = $("#errors-table")
            .DataTable({
                data: model.errorsTable,
                columns: [
                    { title: "DateTime" },
                    { title: "Level" },
                    { title: "Thread ID" },
                    { title: "Message" }
                ],
                responsive: false
            });
    }
}
