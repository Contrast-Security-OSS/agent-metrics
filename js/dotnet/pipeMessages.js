
controllers.pipeMessages = {

    getModel: function() {
        let selectPipeMessages = R.filter(d => d.category == "SensorMsgPipe");
        let orderByTime = R.sortBy(R.prop("time"));

        let startPipeMessage = function () {
            return {
                "NewRequestEndUrl": 0,
                "NewFinding": 0,
                "ModuleResponseMessage": 0,
                "NewResponseHeader": 0,
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

        let countUtilization = function (bucket, data) {
            bucket["bytes"] += parseInt(data.properties["len"] || "0");
        }

        let pipeData = selectPipeMessages(timeline);
        let pipeStats = calcRateStats(pipeData);
        let getPipeChart = R.pipe(() => pipeData, orderByTime, bucketizeByDate(100, startPipeMessage, countBySubcategory));

        let getUtilizationChart = R.pipe(() => pipeData, orderByTime, bucketizeByDate(80, startUtilizationMessage, countUtilization));

        var first = pipeData[0];
        var last = pipeData[pipeData.length - 1];
        var elapsed = last.time - first.time;
        var stepSize = elapsed / 80 / 1000;
        console.log(first, last, elapsed, stepSize);
        
        console.log("utChart", getUtilizationChart());

        let fixedUtilizationData = getUtilizationChart().map(
            function (r) {
                return {
                    "time": r.time,
                    "bytes": parseInt(r.bytes = r.bytes / stepSize)
                }
            });

        console.log("fixed utilization", fixedUtilizationData);



        let pipeTable = new Array();
        for (var i = 0; i < pipeData.length; ++i) {
            let t = pipeData[i];
            let date = moment(t.time).format("MMM Do, h:mm:ss a");
            pipeTable.push(new Array(date, t.appName, t.subcategory, t.properties["len"] || "0"));
        }
        return {
            pipeTable: pipeTable,
            pipeChart: getPipeChart(),
            utilizationChart: fixedUtilizationData,
            pipeStats: pipeStats
        };
    },

    render: function (model) {

        Morris.Area({
            element: 'pipe-chart',
            data: model.pipeChart,
            xkey: 'time',
            ykeys: ['NewRequestEndUrl', "NewFinding", "ModuleResponseMessage", "NewResponseHeader", "Other"],
            labels: ['NewRequestEndUrl', "NewFinding", "ModuleResponseMessage", "NewResponseHeader", "Other"],
            pointSize: 2,
            hideHover: 'auto',
            resize: true
        });

        Morris.Line({
            element: 'utilization-chart',
            data: model.utilizationChart,
            xkey: 'time',
            ykeys: ['bytes'],
            labels: ['Bytes/second'],
            pointSize: 2,
            hideHover: 'auto',
            resize: true
        });

        $("#pipe-table").DataTable({
                data: model.pipeTable,
                columns: [
                    { title: "Time" },
                    { title: "App" },
                    { title: "Type" },
                    { title: "Length" }
                ],
                responsive: false
            });
    }
}



function blah() {}
