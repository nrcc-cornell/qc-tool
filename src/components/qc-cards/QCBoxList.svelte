<script>
	import { Accordion, AccordionItem } from 'svelte-collapsible';
	import QCBox from './QCBox.svelte';
	import QcAcceptReject from './QCAcceptReject.svelte';
	export let data;
	export let mapFly;
	export let currentDataSelected;
	export let changesArray;
	let dataorder = ['TX', 'TN', 'TA', 'PP'];
	export let key;
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

	/* Dummy function for non-flagged data */
	function handleAcceptRejectNA(accept, n, i, sId, data) {
		handleAcceptReject(accept, n, i, sId, data);
		return '';
	}
</script>

<div class="join join-vertical w-full max-h-[60vh] overflow-y-scroll">
	<ul>
		{#each data.item as { nIds, uid, elev, sId, ll, postal, data, slimit, name }, n}
			<QCBox
				{nIds}
				{uid}
				{elev}
				{sId}
				{ll}
				{postal}
				{data}
				{slimit}
				{name}
				{n}
				{cardTrackerArray}
				{dataorder}
				{handleAcceptReject}
				{handleAcceptRejectNA}
				{setKey}
				{key}
			/>
		{/each}
	</ul>
</div>
