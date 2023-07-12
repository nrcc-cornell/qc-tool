<script>
	import { DateInput, DatePicker } from 'date-picker-svelte';

	import QCBoxList from '../components/qc-cards/QCBoxList.svelte';

	import L from 'leaflet?client';
	import 'leaflet/dist/leaflet.css';
	import MarkerPopup from '../components/map/MarkerPopup.svelte';
	let map;

	let allChangesArray = {};
	let changesArray = [];

	const zeroPad = (num, places) => String(num).padStart(places, '0');

	let dataorder = ['TX', 'TN', 'TA', 'PP'];

	let currentDataSelected = 0;
	$: currentDataSelected, rerenderMarkers();

	let placeholderDate = new Date();
	let currentDate = new Date();
	let currentMonth = zeroPad(currentDate.getMonth() + 1, 2);
	let currentDay = zeroPad(currentDate.getDate(), 2);
	let currentYear = zeroPad(currentDate.getFullYear(), 4);

	$: changesArray, (allChangesArray[currentDate.toDateString()] = changesArray);

	let loggedIn = false;
	let user = {
		username: '',
		password: '',
		org: ''
	};

	/* data loading functions */

	async function loadData() {
		const res = await fetch(
			`https://qctool.nrcc.cornell.edu/qc_fail?date=` + currentYear + currentMonth + currentDay
		);
		const item = await res.json();

		return { item };
	}

	async function loadMultiStnData(coords) {
		const res = await fetch('https://data.rcc-acis.org/MultiStnData', {
			method: 'POST',
			body: JSON.stringify({
				date: currentYear + currentMonth + currentDay,
				elems: [1, 2, 3, 4],
				meta: ['name', 'll', 'state', 'elev', 'sids'],
				bbox: [coords[1] - 1, coords[0] - 1, coords[1] + 1, coords[0] + 1]
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const item = await res.json();
		return item;
	}

	let QCdata = loadData().then((data) => generateMarkers(data));

	/* calendar functions */

	const onDateChange = (newDate) => {
		if (allChangesArray[currentDate] == []) {
			delete allChangesArray[currentDate];
			console.log(allChangesArray);
		}
		currentDate = newDate;
		currentMonth = zeroPad(currentDate.getMonth() + 1, 2);
		currentDay = zeroPad(currentDate.getDate(), 2);
		currentYear = zeroPad(currentDate.getFullYear(), 4);
		if (typeof allChangesArray[currentDate] == undefined) {
			allChangesArray[currentDate] = [];
		}
		QCdata = loadData().then((data) => generateMarkers(data));
	};

	$: currentDate, onDateChange(currentDate);

	/* map functions */

	let markerData = [];

	async function generateMarkers(data) {
		for (let i = 0; i < data.item.length; i++) {
			markerData.push(data.item[i]);
		}
		return data;
	}

	function createMap(container) {
		let m = L.map(container, { preferCanvas: true }).setView([37.0902, -95.7129], 5);
		L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
			attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,
	        &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
			subdomains: 'abcd',
			maxZoom: 14
		}).addTo(m);

		return m;
	}

	// Create a popup with a Svelte component inside it and handle removal when the popup is torn down.
	// `createFn` will be called whenever the popup is being created, and should create and return the component.
	function bindPopup(marker, createFn) {
		let popupComponent;
		marker.bindPopup(() => {
			let container = L.DomUtil.create('div');
			popupComponent = createFn(container);
			return container;
		});

		marker.on('popupclose', () => {
			if (popupComponent) {
				let old = popupComponent;
				popupComponent = null;
				// Wait to destroy until after the fadeout completes.
				setTimeout(() => {
					old.$destroy();
				}, 500);
			}
		});
	}

	let markers = new Map();

	function markerIcon(datalabel, isTemp) {
		let html = `<div class="map-marker"style="background-color: pink;border: 1px black solid;text-align: center;padding-right:1.5rem;z-index:999;"><div class="marker-text">${
			datalabel[currentDataSelected] + '~'
		}</div>`;
		if (isTemp) {
			html = `<div class="map-marker-temp"style="background-color: lightblue;border: 1px black solid;text-align: center;padding-right:1.5rem;z-index:0;"><div class="marker-text">${datalabel[currentDataSelected]}</div>`;
		}

		return L.divIcon({
			html,
			className: 'map-marker'
		});
	}

	function createMarker(loc, datalabel, isTemp) {
		let icon = markerIcon(datalabel, isTemp);
		let zindex = 0;
		if (isTemp == false) {
			zindex = 1000;
		}
		let marker = L.marker(loc, { icon, zIndexOffset: zindex });
		bindPopup(marker, (m) => {
			let c = new MarkerPopup({
				target: m,
				props: { datalabel }
			});
		});

		return marker;
	}

	let markerLayers;
	let multiStnMarkerLayer;

	function createMarkers() {
		let newLocation = [];
		let newDatalabel = null;
		markerLayers = L.layerGroup();
		multiStnMarkerLayer = L.layerGroup();
		const arrayColumn = (arr) => arr.map((x) => x[0]);
		for (let datapoint of markerData) {
			newLocation = [datapoint.ll[1], datapoint.ll[0]];
			newDatalabel = arrayColumn(datapoint.data);
			let m = createMarker(newLocation, newDatalabel, false);
			markerLayers.addLayer(m);
		}
		markerLayers.addTo(map);
	}

	function mapAction(container) {
		map = createMap(container);
		createMarkers(map);
		map.on('zoom', function () {
			if (map.getZoom() < 7) {
				if (map.hasLayer(multiStnMarkerLayer)) {
					map.removeLayer(multiStnMarkerLayer);
				}
			}
		});
		return {
			destroy: () => {
				map.remove();
				map = null;
				markerData = [];
			}
		};
	}

	// We could do these in the toolbar's click handler but this is an example
	// of modifying the map with reactive syntax.

	function resizeMap() {
		if (map) {
			map.invalidateSize();
		}
	}
	async function mapFly(coords, isZoomed) {
		if (map.hasLayer(multiStnMarkerLayer)) {
			map.removeLayer(multiStnMarkerLayer);
		}
		map.flyTo(coords, 5 + 3 * isZoomed);
		let newLocation = [];
		let newDatalabel = null;
		multiStnMarkerLayer.clearLayers();
		if (isZoomed) {
			let multiStnMarkerData = await loadMultiStnData(coords);
			for (let datapoint of multiStnMarkerData.data) {
				newLocation = [datapoint.meta.ll[1], datapoint.meta.ll[0]];
				newDatalabel = datapoint.data;
				let n = createMarker(newLocation, newDatalabel, true);
				multiStnMarkerLayer.addLayer(n);
			}
		}
		multiStnMarkerLayer.addTo(map);
		markerLayers.addTo(map);
	}

	function rerenderMarkers() {
		if (map) {
			createMarkers();
		}
	}

	function handleLogin() {
		if (user.username !== '') {
			loggedIn = true;
		}
	}
</script>

<svelte:window on:resize={resizeMap} />
<html data-theme="light" lang="html">
	<div class="max-h-screen">
		{#if loggedIn}
			<div class="flex flex-row bg-base-300 p-2 items-center max-h-20 h-16" id="login-container">
				<div class="text-xl font-medium mr-10 ml-8">
					Welcome {user.username}! Please make QC changes on the left, using the map on the right as
					a reference. When finished, please press 'Submit'!
				</div>
			</div>
		{:else}
			<div class="flex flex-row bg-base-300 p-2 items-center max-h-20 h-16" id="login-container">
				<div class="text-xl font-medium mr-10 ml-8">Welcome! Please Log in here:</div>
				<input
					type="text"
					placeholder="Username"
					class="input input-bordered w-full max-w-xs mx-2"
					bind:value={user.username}
				/>
				<input
					type="password"
					placeholder="Password"
					class="input input-bordered w-full max-w-xs mx-2"
					bind:value={user.password}
				/>
				<select class="select select-bordered w-full max-w-xs mx-2" bind:value={user.org}>
					<option disabled selected>Select One</option>
					<option>HPRCC</option>
					<option>MRCC</option>
					<option>NRCC</option>
					<option>SERCC</option>
					<option>SRCC</option>
					<option>WRCC</option>
				</select>
				<button class="btn btn-primary" on:click={handleLogin}>Login</button>
			</div>
		{/if}

		<div class="flex flex-row grow" id="main-content-container">
			<div class="ml-4 shrink overflow-y-hidden basis-1/4" id="cal-cards-container">
				<div class="m-4 card card-normal bg-base-100 shadow-xl" id="cal-container">
					<DatePicker bind:value={currentDate} max={placeholderDate} />
				</div>
				{#await QCdata}
					<span class="loading loading-spinner loading-lg" />
				{:then data}
					<div class="m-4 card card-normal bg-base-100 shadow-xl" id="qc-list-container">
						<QCBoxList {data} {mapFly} {currentDataSelected} bind:changesArray />
					</div>
				{/await}
			</div>
			<div class="grow m-4 mt-0 mr-8 basis-3/4" id="map-changes-container">
				<div class="m-4 card card-normal bg-base-100 shadow-xl" id="map-mapbar-container">
					<div class="card-body">
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
						{#await QCdata}
							<div class="p-72">
								<span class="loading loading-spinner loading-lg text-primary" />
							</div>
						{:then data}
							<div style="height:40rem;width:100%;margin:0rem;border-radius:1rem;" use:mapAction />
						{/await}
					</div>
				</div>
				<div class="m-4 card lg:card-side bg-base-100 shadow-xl" id="changes-container">
					<button
						class={Object.values(changesArray).length == 0 || !loggedIn
							? 'btn w-full btn-primary btn-disabled'
							: 'btn w-full btn-primary'}
						onclick="my_modal_1.showModal()">Submit</button
					>
					<dialog id="my_modal_1" class="modal">
						<form method="dialog" class="modal-box">
							<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
							<h3 class="text-2xl font-bold text-gray-900 dark:text-white pb-2">
								Are you sure you would like to submit the following changes:
							</h3>
							{#each Object.entries(allChangesArray) as [date, changes], i}
								<h2 class="text-xl font-semibold text-gray-900 dark:text-white pb-2">
									{date}
								</h2>
								{#each changes as change, i}
									{#if typeof change !== 'undefined'}
										<p class="text-base text-gray-900 dark:text-white">{change}</p>
									{/if}
								{/each}
							{/each}
							<div class="modal-action">
								<!-- if there is a button in form, it will close the modal -->
								<button class="btn btn-primary">Submit</button>
							</div>
						</form>
					</dialog>
				</div>
			</div>
		</div>
	</div>
</html>
