<script>
	// @ts-nocheck
	import QCBoxList from '../components/qc-cards/QCBoxList.svelte';

	import DatePicker from '../components/date-picker/DatePicker.svelte';

	import L from 'leaflet?client';
	import 'leaflet/dist/leaflet.css';
	import MarkerPopup from '../components/map/MarkerPopup.svelte';
	let map;

	const zeroPad = (num, places) => String(num).padStart(places, '0');

	let dataorder = ['TX', 'TN', 'TA', 'PP'];

	let currentDataSelected = 0;
	$: currentDataSelected, rerenderMarkers();

	let currentDate = new Date();
	let currentMonth = zeroPad(currentDate.getMonth() + 1, 2);
	let currentDay = zeroPad(currentDate.getDate(), 2);
	let currentYear = zeroPad(currentDate.getFullYear(), 4);

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

	const onDateChange = (d) => {
		currentDate = d.detail;
		currentMonth = zeroPad(currentDate.getMonth() + 1, 2);
		currentDay = zeroPad(currentDate.getDate(), 2);
		currentYear = zeroPad(currentDate.getFullYear(), 4);
		QCdata = loadData().then((data) => generateMarkers(data));
	};

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
		let marker = L.marker(loc, { icon });
		bindPopup(marker, (m) => {
			let c = new MarkerPopup({
				target: m,
				props: {
					datalabel
				}
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
			console.log('added!');
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
	if (map) {
		console.log('test');
		map.on('zoomlevelchange', function () {
			if (map.getZoom < 7) {
				if (map.hasLayer(multiStnMarkerLayer)) {
					map.removeLayer(multiStnMarkerLayer);
					console.log('removed!');
				}
			}
		});
	}
</script>

<svelte:window on:resize={resizeMap} />

<DatePicker
	on:datechange={onDateChange}
	selected={currentDate}
	isAllowed={(date) => {
		const millisecs = date.getTime();
		if (millisecs > Date.now()) return false;
		return true;
	}}
/>
{#await QCdata}
	<p>Loading...</p>
{:then data}
	<div class="card-map-container">
		<QCBoxList {data} {mapFly} {currentDataSelected} />
		<div style="height:40rem;width:70%;margin:2rem;">
			<label>
				<input type="radio" bind:group={currentDataSelected} name="currentDataSelected" value={0} />
				TMAX
			</label>

			<label>
				<input type="radio" bind:group={currentDataSelected} name="currentDataSelected" value={1} />
				TMIN
			</label>

			<label>
				<input type="radio" bind:group={currentDataSelected} name="currentDataSelected" value={2} />
				TOBS
			</label>
			<label>
				<input type="radio" bind:group={currentDataSelected} name="currentDataSelected" value={3} />
				PRCP
			</label>
			<div style="height:40rem;width:100%;margin:0rem;" use:mapAction />
		</div>
	</div>
{/await}

<style>
	.card-map-container {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.map :global(.map-marker) {
		width: 100%;
		text-align: center;
		font-weight: 600;
		background-color: #444;
		color: #eee;
		border-radius: 0.5rem;
	}
</style>
