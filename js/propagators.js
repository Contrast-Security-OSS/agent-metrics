propagatorFrameTableRows = []
propagatorStackTableRows = []

function changePropagatorsView() {
	$.ajax({
        url : 'propagators.html',
        type: 'GET',
        success: function(data){
            $('#page-wrapper').html(data);
            bucketizePropagators();
        }
    });
}

function bucketizePropagators() {
	$.getJSON('/data/propagator-frames.json', function(frames) {
		propagatorFrameTableRows.length = 0
		for(var i=0;i<frames.length;i++) {
			propagatorFrameTableRows.push(Array(frames[i].frame, frames[i].count))
		}
		loadPropagatorFramesTable();
	});
	
	$.getJSON('/data/propagator-stacks.json', function(frames) {
		propagatorStackTableRows.length = 0
		for(var i=0;i<frames.length;i++) {
			propagatorStackTableRows.push(Array(frames[i].stack.join("<br/>"), frames[i].count, frames[i].type))
		}
		loadPropagatorStacksTable();
	});
}

function loadPropagatorFramesTable() {
	$('#propagator-frame-table').DataTable({
		data: propagatorFrameTableRows,
		order: [[ 1, "desc" ]],
		columns: [
		          { title: "Frame" },
		          { title: "Count" }
		         ],
        responsive: true
    });
}

function loadPropagatorStacksTable() {
	$("#propagator-stack-table").DataTable({
		data: propagatorStackTableRows,
		order: [[ 1, "desc" ]],
		columns: [
		          { title: "Stack" },
		          { title: "Count" },
		          { title: "Type" }
		         ],
        responsive: true
    });
}