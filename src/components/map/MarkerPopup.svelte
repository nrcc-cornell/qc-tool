<script>
	export let datalabel;

	function formatDatalabel(datalabel) {
		let newDataLabel =
			'TMAX = ' +
			datalabel[0] +
			'\n TMIN = ' +
			datalabel[1] +
			'\n TOBS = ' +
			datalabel[2] +
			'\n PRCP = ' +
			datalabel[3];
		return newDataLabel;
	}
</script>

<div style="width:100%;text-align:center;font-weight:600">
	{formatDatalabel(datalabel)}
</div>

<style>
</style>
