<script>
	export let handleAcceptReject;
	export let n;
	export let i;
	export let sId;
	export let data;

	let clicked = false;
	let AoR = false;

	function handleAcceptRejectButton(accept, n, i, sId, data) {
		handleAcceptReject(accept, n, i, sId, data);

		clicked = true;
		AoR = accept;
	}
</script>

<div>
	<button
		class={clicked && AoR
			? 'btn btn-circle btn-outline btn-success btn-active'
			: 'btn btn-circle btn-outline btn-success'}
		on:click={() => handleAcceptRejectButton(true, n, i, sId, data)}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 18L18 6M6 6l12 12"
			/></svg
		>
	</button>
	<button
		class={clicked && !AoR
			? 'btn btn-circle btn-outline btn-error btn-active'
			: 'btn btn-circle btn-outline btn-error'}
		on:click={() => handleAcceptRejectButton(false, n, i, sId, data)}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 18L18 6M6 6l12 12"
			/></svg
		></button
	>
</div>
