<script>
	// @ts-nocheck
	import QCBoxList from '../components/QCBoxList.svelte';

	import DatePicker from '../components/date-picker/DatePicker.svelte';

	import L from 'leaflet?client';
	import 'leaflet/dist/leaflet.css';
	import * as markerIcons from '../components/map/markers';
	import MarkerPopup from '../components/map/MarkerPopup.svelte';
	let map;

	const zeroPad = (num, places) => String(num).padStart(places, '0');

	let currentDate = new Date();
	let currentMonth = zeroPad(currentDate.getMonth() + 1, 2);
	let currentDay = zeroPad(currentDate.getDate(), 2);
	let currentYear = zeroPad(currentDate.getFullYear(), 4);

	/* data loading functions */

	async function loadData() {
		console.log(
			`https://qctool.nrcc.cornell.edu/qc_fail?date=` + currentYear + currentMonth + currentDay
		);
		console.log(Date.now());
		const res = await fetch(
			`https://qctool.nrcc.cornell.edu/qc_fail?date=` + currentYear + currentMonth + currentDay
		);
		const item = await res.json();

		return { item };
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

	let markerLocations = [];

	async function generateMarkers(data) {
		for (let i = 0; i < data.item.length; i++) {
			markerLocations.push(data.item[i].ll);
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

	function markerIcon(count) {
		let html = `<div class="map-marker"><div>${markerIcons.library}</div><div class="marker-text">${count}</div></div>`;
		return L.divIcon({
			html,
			className: 'map-marker'
		});
	}

	function createMarker(loc) {
		let icon = markerIcon(loc[1]);
		let marker = L.marker(loc, { icon });
		bindPopup(marker, (m) => {
			let c = new MarkerPopup({
				target: m,
				props: {
					count
				}
			});

			c.$on('change', ({ detail }) => {
				count = detail;
				marker.setIcon(markerIcon(count));
			});

			return c;
		});

		return marker;
	}

	let markerLayers;
	let lineLayers;
	function mapAction(container) {
		map = createMap(container);
		let newLocation = [];
		markerLayers = L.layerGroup();
		for (let location of markerLocations) {
			newLocation = [location[1], location[0]];
			console.log(newLocation);
			let m = createMarker(newLocation);
			markerLayers.addLayer(m);
		}

		markerLayers.addTo(map);

		return {
			destroy: () => {
				map.remove();
				map = null;
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
</script>

<svelte:window on:resize={resizeMap} />

<h1>Welcome to SvelteKit</h1>
<p>{currentDate.getDate() + ' ' + currentDate.getMonth() + ' ' + currentDate.getFullYear()}</p>
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
		<QCBoxList {data} />

		<div style="height:50rem;width:80%" use:mapAction />
	</div>
{/await}

<style>
	.card-map-container {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
</style>
