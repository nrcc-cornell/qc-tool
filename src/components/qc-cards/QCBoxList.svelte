<script>
	import { Accordion, AccordionItem } from 'svelte-collapsible';
	import QcAcceptReject from './QCAcceptReject.svelte';
	export let data;
	export let mapFly;
	export let currentDataSelected;
	export let changesArray;
	let dataorder = ['TX', 'TN', 'TA', 'PP'];
	let key = null;
	$: key, handleAccordionChange(key);
	$: currentDataSelected, handleAccordionChange(key);

	let cardTrackerArray = Array(data.item.length);

	if (changesArray.length != data.item.length) {
		if (changesArray.length != 0) {
			alert(
				'Station data for this date has changed between your last load of this date and now. Your changes have been reset for this date. Please input them again.'
			);
		}
		changesArray = Array(data.item.length);
	} else {
		for (let i = 0; i < changesArray.length; i++) {
			if (changesArray[i] != undefined) {
				cardTrackerArray[i] = {
					tx: changesArray[i].tx,
					tn: changesArray[i].tn,
					ta: changesArray[i].ta,
					pp: changesArray[i].pp,
					accept: true
				};
			}
		}
	}

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
			change = {
				sId: sId,
				tx: tempObject.tx === 'N/A' ? null : tempObject.tx,
				tn: tempObject.tn === 'N/A' ? null : tempObject.tn,
				ta: tempObject.ta === 'N/A' ? null : tempObject.ta,
				pp: tempObject.pp === 'N/A' ? null : tempObject.pp,
				data: [data[0][0], data[1][0], data[2][0], data[3][0]]
			};

			changesArray[n] = change;
		}
		cardTrackerArray[n] = tempObject;
	}

	function handleAcceptRejectNA(accept, n, i, sId, data) {
		handleAcceptReject(accept, n, i, sId, data);
		return '';
	}
</script>

<div class="join join-vertical w-full max-h-[60vh] overflow-y-scroll">
	<ul>
		{#each data.item as { nIds, uid, elev, sId, ll, postal, data, slimit, name }, n}
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

		upgrade to sveltekit 1.24
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
		{/each}
	</ul>
</div>
