<script>
	import { Accordion, AccordionItem } from 'svelte-collapsible';
	export let data;
	export let mapFly;
	export let currentDataSelected;
	export let changesArray;
	let dataorder = ['TX', 'TN', 'TA', 'PP'];
	let key = null;
	$: key, handleAccordionChange(key);
	$: currentDataSelected, handleAccordionChange(key);

	let cardTrackerArray = Array(data.item.length);

	changesArray = Array(data.item.length);

	async function handleAccordionChange(key) {
		if ((await key) == null) {
			await mapFly([37.0902, -95.7129], false);
		} else {
			await mapFly([key[1], key[0]], true);
		}
	}

	function setKey(newKey) {
		key = newKey;
	}

	function handleAcceptReject(accept, n, i, sId, data) {
		let change = '';
		let tempObject = {
			tx: null,
			tn: null,
			ta: null,
			pp: null,
			accept: null
		};
		if (!(cardTrackerArray[n] === null)) {
			for (var k in cardTrackerArray[n]) {
				tempObject[k] = cardTrackerArray[n][k];
			}
		}
		switch (i) {
			case 0:
				tempObject.tx = accept;
				break;
			case 1:
				tempObject.tn = accept;
				break;
			case 2:
				tempObject.ta = accept;
				break;
			case 3:
				tempObject.pp = accept;
				break;
		}
		if (
			!(
				tempObject.tx === null ||
				tempObject.tn === null ||
				tempObject.ta === null ||
				tempObject.pp === null
			)
		) {
			tempObject.accept = tempObject.tx || tempObject.tn || tempObject.ta || tempObject.pp;
			change =
				sId +
				' ' +
				(tempObject.tx === 'N/A'
					? ''
					: 'TX; ' + data[0][0] + '~! -> ' + data[0][0] + (tempObject.tx ? '!' : '')) +
				' ' +
				(tempObject.tn === 'N/A'
					? ''
					: 'TN; ' + data[1][0] + '~! -> ' + data[1][0] + (tempObject.tn ? '!' : '')) +
				' ' +
				(tempObject.ta === 'N/A'
					? ''
					: 'TA; ' + data[2][0] + '~! -> ' + data[2][0] + (tempObject.ta ? '!' : '')) +
				' ' +
				(tempObject.pp === 'N/A'
					? ''
					: 'PP; ' + data[3][0] + '~! -> ' + data[3][0] + (tempObject.pp ? '!' : ''));
			changesArray[n] = change;
			console.log(changesArray);
		}
		cardTrackerArray[n] = tempObject;
	}

	function handleAcceptRejectNA(accept, n, i, sId, data) {
		handleAcceptReject(accept, n, i, sId, data);
		return '';
	}
</script>

<div class="overflow-scroll">
	<ul>
		<!-- <Accordion bind:key>
		{#each data.item as { nIds, uid, elev, sId, ll, postal, data, slimit, name }, n}
			<AccordionItem key={ll}>
				<h2 slot="header">{postal + ' ' + name}</h2>
				<div slot="body">
					{#each data as [qcdatafigure, num1, num2], i}
						{#if dataorder[i] == 'PP'}
							{#if qcdatafigure > slimit.PP}
								<p>{dataorder[i]}</p>
								<p>{qcdatafigure + '~! (' + 0 + ', ' + slimit[dataorder[i]] + ')'}</p>
							{/if}
						{:else if qcdatafigure < slimit[dataorder[i]][0] || qcdatafigure > slimit[dataorder[i]][1]}
							<p>{dataorder[i]}</p>
							<p>
								{qcdatafigure +
									'~! (' +
									slimit[dataorder[i]][0] +
									', ' +
									slimit[dataorder[i]][1] +
									')'}
							</p>
						{/if}
					{/each}
				</div>
			</AccordionItem>
		{/each}
	</Accordion> -->

		{#each data.item as { nIds, uid, elev, sId, ll, postal, data, slimit, name }, n}
			<div
				class={typeof cardTrackerArray[n].accept !== 'undefined'
					? cardTrackerArray[n].accept !== 'null'
						? cardTrackerArray[n].accept
							? 'collapse collapse-plus bg-success'
							: 'collapse collapse-plus bg-base-200'
						: 'collapse collapse-plus bg-base-200'
					: 'collapse collapse-plus bg-base-200'}
			>
				<input type="radio" name="my-accordion-3" checked={false} on:click={setKey(ll)} />
				<div class="collapse-title text-xl font-medium">
					{postal + ' ' + name}
				</div>
				<div class="collapse-content">
					{#each data as [qcdatafigure, num1, num2], i}
						{#if dataorder[i] == 'PP'}
							{#if qcdatafigure > slimit.PP}
								<p>{dataorder[i]}</p>
								<p>{qcdatafigure + '~! (' + 0 + ', ' + slimit[dataorder[i]] + ')'}</p>
								<div class="join">
									<button
										class="btn btn-success join-item"
										on:click={() => handleAcceptReject(true, n, i, sId, data)}>Accept</button
									>
									<button
										class="btn btn-error join-item"
										on:click={() => handleAcceptReject(false, n, i, sId, data)}>Reject</button
									>
								</div>
							{:else}
								<div>{handleAcceptRejectNA('N/A', n, i, sId, data)}</div>
							{/if}
						{:else if !slimit[dataorder[i]] || qcdatafigure < slimit[dataorder[i]][0] || qcdatafigure > slimit[dataorder[i]][1]}
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
							<div class="join">
								<button
									class="btn btn-success join-item"
									on:click={() => handleAcceptReject(true, n, i, sId, data)}>Accept</button
								>
								<button
									class="btn btn-error join-item"
									on:click={() => handleAcceptReject(false, n, i, sId, data)}>Reject</button
								>
							</div>
						{:else}
							<div>{handleAcceptRejectNA('N/A', n, i, sId, data)}</div>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	</ul>
</div>
