controllers.teamserver = {

    getModel: function () {
        var selectUrls = R.filter(d => d.category == "TeamServerMessage");
        var orderByTime = R.sortBy(R.prop("time"));

        var startTotal = function () { return { "total": 0 } };
        var countTotal = (bucket, data) => bucket.total++;

        let tsData = selectUrls(timeline);
        let tsStats = calcRateStats(tsData);
        let getTsChart = R.pipe(() => tsData, orderByTime, bucketizeByDate(100, startTotal, countTotal));

        let tsTable = new Array();
        for (var i = 0; i < tsData.length; ++i) {
            let t = tsData[i];
            tsTable.push(new Array(new Date(t.time), t.appName, t.subcategory, t.properties["time"] || "0"));
        }

        console.log(tsData);

        return {
            tsStats: tsStats,
            tsChart: getTsChart(),
            tsTable: tsTable
        };
    },
    render: function (model) {
        Morris.Area({
            element: 'ts-chart',
            data: model.tsChart,
            xkey: 'time',
            ykeys: ["total"],
            labels: ['URLs Hit'],
            pointSize: 2,
            hideHover: 'auto',
            resize: true
        });

        $("#ts-table").DataTable({
            data: model.tsTable,
            columns: [
                { title: "Time" },
                { title: "App" },
                { title: "Type" },
                { title: "Duration (ms)" }
            ],
            responsive: false
        });
    }
}