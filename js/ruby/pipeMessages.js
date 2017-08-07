
controllers.pipeMessages = {

    getModel: function() {
        let selectPipeMessages = R.filter(d => d.category == "SensorMsgPipe");
        let orderByTime = R.sortBy(R.prop("time"));

        let startPipeMessage = function () {
            return {
                "LoadLastServerConfig": 0,
                "StartServer": 0,
                "RefreshGeneratedRules": 0,
                "CreateApplication": 0,
                "SendAppUpdate": 0,
                "RecordAppInfo": 0,
                "RecordServerInfo":0,
                "RecordRequest": 0,
                "AccumulateRule": 0,
                "SendFindings": 0,
                "SendAppActivity": 0,
                "CheckAccumulatedRules": 0,
                "Other": 0
            }
        }
        let countBySubcategory = function (bucket, data) {
            if (bucket[data.subcategory] != undefined)
                bucket[data.subcategory]++;
            else
                bucket["Other"]++;
        }


        let startUtilizationMessage = function () {
            return {
                "bytes": 0
            }
        }


        let pipeData = selectPipeMessages(timeline);
        let pipeStats = calcRateStats(pipeData);
        let getPipeChart = R.pipe(() => pipeData, orderByTime, bucketizeByDate(100, startPipeMessage, countBySubcategory));

        var first = pipeData[0];
        var last = pipeData[pipeData.length - 1];
        var elapsed = last.time - first.time;
        var stepSize = elapsed / 80 / 1000;
        console.log(first, last, elapsed, stepSize);




        let pipeTable = new Array();
        for (var i = 0; i < pipeData.length; ++i) {
            let t = pipeData[i];
            let date = moment(t.time).format("MMM Do, h:mm:ss a");
            pipeTable.push(new Array(date, t.appName, t.subcategory, t.properties["len"] || "0"));
        }
        return {
            pipeTable: pipeTable,
            pipeChart: getPipeChart(),
            pipeStats: pipeStats
        };
    },

    render: function (model) {
        var keys = ['LoadLastServerConfig', "StartServer", "RefreshGeneratedRules", "CreateApplication","SendAppUpdate",
            "RecordAppInfo","RecordServerInfo","RecordRequest","AccumulateRule","SendFindings","SendAppActivity","CheckAccumulatedRules",
            "Other"];
        Morris.Area({
            element: 'pipe-chart',
            data: model.pipeChart,
            xkey: 'time',
            ykeys: keys ,
            labels: keys,
            pointSize: 2,
            hideHover: 'auto',
            resize: true
        });



        $("#pipe-table").DataTable({
                data: model.pipeTable,
                columns: [
                    { title: "Time" },
                    { title: "App" },
                    { title: "Type" }
                ],
                responsive: false
            });
    }
}



function blah() {}
