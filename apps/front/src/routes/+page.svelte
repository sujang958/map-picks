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
	<main class="h-full w-full max-w-4xl rounded-lg p-3 py-24">
		<h1 class="text-3xl font-semibold">Bo3 Map Picks</h1>
		<h1 class="mt-2 text-base text-neutral-500">Time Limit 10:00</h1>
		<div class="mt-8 grid grid-cols-7">
			<MapPick team="T1" active />
			<MapPick team="T2" />
			<MapPick team="T1" type="Select" enemyTeam="T2" />
			<MapPick team="T2" type="Select" enemyTeam="T1" />
			<MapPick team="T1" />
			<MapPick team="T2" />
			<MapPick team="" type="Remainder" enemyTeam="T1" />
		</div>

		<div class="mt-16 flex flex-row justify-between gap-x-3">
			<div>
				<header class="text-left">
					<p class="flex flex-row items-center gap-x-2 text-xl font-semibold">
						T1(You) <svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="size-3 fill-red-800"
						>
							<path
								d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z"
							/>
						</svg>
					</p>
					<p class="mt-1 text-sm text-neutral-500">Choosing a map...</p>
				</header>
			</div>
			<div>
				<header class="text-right">
					<p class="flex flex-row items-center gap-x-2 text-xl font-semibold">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="size-3 fill-neutral-800"
						>
							<path
								d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z"
							/>
						</svg> T2
					</p>
					<p class="mt-1 text-sm text-neutral-500">Waiting...</p>
				</header>
			</div>
		</div>
	</main>
</div>
