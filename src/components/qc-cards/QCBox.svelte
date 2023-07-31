<script>
	export let nIds;
	export let uid;
	export let elev;
	export let sId;
	export let ll;
	export let postal;
	export let data;
	export let slimit;
	export let name;
	export let n;
	export let cardTrackerArray;
	export let dataorder;
	export let handleAcceptReject;
	export let handleAcceptRejectNA;
	export let setKey;
	export let key;
	import QcAcceptReject from './QCAcceptReject.svelte';
	console.log(slimit);
	let forceOpen = '';

	async function handleKeyChange() {
		if ((await key) == null) {
			forceOpen = '';
		} else {
			forceOpen = key[0] == ll[0] && key[1] == ll[1] ? 'collapse-open' : '';

			console.log(key);
			console.log(ll);
			console.log(forceOpen);
		}
	}

	$: key, handleKeyChange();
</script>

<div
	class={typeof cardTrackerArray[n].accept !== 'undefined'
		? cardTrackerArray[n].accept !== 'null'
			? cardTrackerArray[n].accept
				? 'collapse collapse-arrow join-item border border-primary bg-primary-content'
				: 'collapse collapse-arrow join-item border border-base-300 bg-base-200'
			: 'collapse collapse-arrow join-item border border-base-300 bg-base-200'
		: 'collapse collapse-arrow join-item border border-base-300 bg-base-200'}
>
	<input type="radio" name="my-accordion-3" checked={false} on:click={setKey(ll)} />
	<div class="collapse-title text-xl font-medium">
		{postal + ' ' + name}
	</div>
	<div class="collapse-content">
		<!-- toDataFlag : function (vName, datum) {
						var d = datum[0], f = datum[1], s = '';
						if (f == 0) { s = ''; }
						else if ((f & 0x0800) == 0x0800) { s = 'M'; }
						else if ((f & 0x0001) == 0x0001) { s = 'T'; }
						else if (vName == 'PP') { s = (d/100).toString(); }
						else { s = d.toString(); }
						if ( (f & 0x00ff0000) != 0 ) { s += '~'; } <- this is the error
						if ( (f & 0x00010000) == 0x00010000 ) { s += '!'; }
						return s;

                        set up local storage cmon dude
					}, -->
		{#each data as [qcdatafigure, num1, num2], i}
			{#if dataorder[i] == 'PP'}
				{#if (num1 & 0x00ff0000) != 0}
					<div class="flex flex-row justify-between mb-2">
						<div>
							<p>{dataorder[i]}</p>
							<p>{qcdatafigure + '~! (' + 0 + ', ' + slimit[dataorder[i]] + ')'}</p>
						</div>
						<QcAcceptReject
							{handleAcceptReject}
							{n}
							{i}
							{sId}
							{data}
							accepted={cardTrackerArray[n] == undefined ? null : cardTrackerArray[n].pp}
						/>
					</div>
				{:else}
					<div>{handleAcceptRejectNA('N/A', n, i, sId, data)}</div>
				{/if}
			{:else if num1 & 0x00ff0000}
				<div class="flex flex-row justify-between mb-2">
					<div>
						<p>{dataorder[i]}</p>
						<p>
							{slimit[dataorder[i]]
								? qcdatafigure +
								  '~! (' +
								  slimit[dataorder[i]][0] +
								  ', ' +
								  slimit[dataorder[i]][1] +
								  ')'
								: qcdatafigure + '~! '}
						</p>
					</div>
					<QcAcceptReject
						{handleAcceptReject}
						{n}
						{i}
						{sId}
						{data}
						accepted={cardTrackerArray[n] == undefined
							? null
							: cardTrackerArray[n][dataorder[i].toLowerCase()]}
					/>
				</div>
			{:else}
				<div>{handleAcceptRejectNA('N/A', n, i, sId, data)}</div>
			{/if}
		{/each}
	</div>
</div>
