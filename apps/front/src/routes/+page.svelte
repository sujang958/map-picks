<script lang="ts">
	import MapPick from '$lib/components/MapPick.svelte';
	import { onDestroy, onMount } from 'svelte';

	onMount(() => {
		const ws = new WebSocket('ws://localhost:3000/ws');

		ws.onopen = () => {
			console.log('WebSocket connection opened');
			ws.send('Hello Server!');
		};
	});
</script>

<div class="grid h-screen w-full place-items-center">
	<main class="w-full max-w-4xl rounded-lg p-3">
		<h1 class="text-3xl font-semibold">Bo3 Map Picks</h1>
		<h1 class="mt-2 text-base text-neutral-500">Time Limit 10:00</h1>
		<div class="mt-8 grid grid-cols-7">
			<MapPick team="T1" />
			<MapPick team="T2" />
			<MapPick team="T1" type="Select" enemyTeam="T2" />
			<MapPick team="T2" type="Select" enemyTeam="T1" />
			<MapPick team="T1" />
			<MapPick team="T2" />
			<MapPick team="" type="Remainder" enemyTeam="T1" />
		</div>
	</main>
</div>
