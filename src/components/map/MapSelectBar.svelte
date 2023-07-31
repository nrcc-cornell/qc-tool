<script>
	export let currentDataSelected;
</script>

<div class="flex join mb-4">
	<input
		class="join-item w-1/4 btn"
		type="radio"
		name="options"
		aria-label="TMAX"
		bind:group={currentDataSelected}
		value={0}
	/>
	<input
		class="join-item w-1/4 btn"
		type="radio"
		name="options"
		aria-label="TMIN"
		bind:group={currentDataSelected}
		value={1}
	/>
	<input
		class="join-item w-1/4 btn"
		type="radio"
		name="options"
		aria-label="TOBS"
		bind:group={currentDataSelected}
		value={2}
	/>
	<input
		class="join-item w-1/4 btn"
		type="radio"
		name="options"
		aria-label="PRCP"
		bind:group={currentDataSelected}
		value={3}
	/>
</div>
