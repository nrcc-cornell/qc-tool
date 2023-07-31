<script>
	import { DateInput, DatePicker } from 'date-picker-svelte';

	import { onMount } from 'svelte';

	import QCBoxList from '../components/qc-cards/QCBoxList.svelte';

	import L from 'leaflet?client';
	import 'leaflet/dist/leaflet.css';
	import MarkerPopup from '../components/map/MarkerPopup.svelte';

	import LoginBar from '../components/login/LoginBar.svelte';
	import MapSelectBar from '../components/map/MapSelectBar.svelte';
	import SubmitButton from '../components/submission/SubmitButton.svelte';

	/* Initializing Variables */

	let map;

	const zeroPad = (num, places) => String(num).padStart(places, '0');

	let dataorder = ['TX', 'TN', 'TA', 'PP'];

	let currentDataSelected = 0;
	$: currentDataSelected, rerenderMarkers();

	let placeholderDate = new Date();
	let currentDate = new Date();
	let currentMonth = zeroPad(currentDate.getMonth() + 1, 2);
	let currentDay = zeroPad(currentDate.getDate(), 2);
	let currentYear = zeroPad(currentDate.getFullYear(), 4);

	let allChangesArray = {};
	let changesArray = [];

	let key = null;

	$: changesArray, onChangeArrayChange();

	function onChangeArrayChange() {
		if (typeof allChangesArray[currentDate.toDateString()] != undefined) {
			allChangesArray[currentDate.toDateString()] = changesArray;
		}
	}

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

	let QCdata;

	onMount(async () => {
		QCdata = loadData().then((data) => generateMarkers(data));
	});

	/* calendar functions */

	const onDateChange = (newDate) => {
		currentDate = newDate;
		currentMonth = zeroPad(currentDate.getMonth() + 1, 2);
		currentDay = zeroPad(currentDate.getDate(), 2);
		currentYear = zeroPad(currentDate.getFullYear(), 4);
		if (allChangesArray[currentDate.toDateString()] == null) {
			changesArray = [];
		} else {
			changesArray = allChangesArray[currentDate.toDateString()];
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
	function bindPopup(marker, createFn, loc) {
		let popupComponent;
		marker.bindPopup(() => {
			let container = L.DomUtil.create('div');
			popupComponent = createFn(container);
			return container;
		});

		marker.on('popupopen', function () {
			mapFly(loc, true);
			key = [loc[1], loc[0]];
			console.log('loc ' + key);
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
		bindPopup(
			marker,
			(m) => {
				let c = new MarkerPopup({
					target: m,
					props: { datalabel }
				});
			},
			loc
		);

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
		map.on('zoomend', function () {
			if (map.getZoom() < 7) {
				if (map.hasLayer(multiStnMarkerLayer)) {
					map.removeLayer(multiStnMarkerLayer);
				}
			}
		});
		map.on('zoomstart', function () {
			if (map.hasLayer(multiStnMarkerLayer)) {
				map.removeLayer(multiStnMarkerLayer);
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

	/* login functions */

	function handleLogin() {
		if (user.username !== '') {
			loggedIn = true;
		}
	}
</script>

<svelte:window on:resize={resizeMap} />
<html data-theme="light" lang="html">
	<div class="max-h-screen">
		<LoginBar {loggedIn} {user} {handleLogin} />
		<div class="flex flex-row grow" id="main-content-container">
			<div class="ml-4 shrink overflow-y-hidden basis-1/4" id="cal-cards-container">
				<div class="m-4 card card-normal bg-base-100 shadow-xl" id="cal-container">
					<DatePicker bind:value={currentDate} max={placeholderDate} />
				</div>
				{#await QCdata}
					<span class="loading loading-spinner loading-lg" />
				{:then data}
					<div class="m-4 card card-normal bg-base-100 shadow-xl" id="qc-list-container">
						<QCBoxList {data} {mapFly} {currentDataSelected} bind:changesArray bind:key />
					</div>
				{/await}
			</div>
			<div class="grow m-4 mt-0 mr-8 basis-3/4" id="map-changes-container">
				<div class="m-4 card card-normal bg-base-100 shadow-xl" id="map-mapbar-container">
					<div class="card-body">
						<MapSelectBar bind:currentDataSelected />
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
					<SubmitButton {allChangesArray} {loggedIn} />
				</div>
			</div>
		</div>
	</div>
</html>
