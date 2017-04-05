controllers.urls = {

    getModel: function () {
        var selectUrls = R.filter(d => d.category == "RequestAnalysis");
        var orderByTime = R.sortBy(R.prop("time"));

        var startTotal = function () { return { "total": 0 } };
        var countTotal = (bucket, data) => bucket.total++;

        let urlData = selectUrls(timeline);
        let urlStats = calcRateStats(urlData);
        let getUrlChart = R.pipe(() => urlData, orderByTime, bucketizeByDate(100, startTotal, countTotal));

        let urlTable = new Array();
        for (var i = 0; i < urlData.length; ++i) {
            let t = urlData[i];
            urlTable.push(new Array(new Date(t.time), t.appName, t.subcategory, t.properties["url"]));
        }

        return {
            urlStats: urlStats,
            urlChart: getUrlChart(),
            urlTable: urlTable
        };
    },

    render: function (model) {
        Morris.Area({
            element: 'url-chart',
            data: model.urlChart,
            xkey: 'time',
            ykeys: ["total"],
            labels: ['URLs Hit'],
            pointSize: 2,
            hideHover: 'auto',
            resize: true
        });

        $("#url-table").DataTable({
            data: model.urlTable,
            columns: [
                { title: "Time" },
                { title: "App" },
                { title: "Result" },
                { title: "Url"}                
            ],
            responsive: false
        });
    }
}