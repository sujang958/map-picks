<script lang="ts">
	import MapPick from '$lib/components/MapPick.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { PageProps } from './$types';
	import typia from 'typia';
	import type { WSResponse } from '@self/types/ws';
	import { MatchMapPicks, type JSONMatchMapPicks } from '@self/core';
	import SuperJSON from 'superjson';

	let { params }: PageProps = $props();

	const MAPS = {
		abyss: {
			name: 'Abyss',
			image: '/maps/abyss.webp'
		},
		ascent: {
			name: 'Ascent',
			image: '/maps/ascent.jpg'
		},
		bind: {
			name: 'Bind',
			image: '/maps/bind.png'
		},
		haven: {
			name: 'Haven',
			image: '/maps/haven.webp'
		},
		lotus: {
			name: 'Lotus',
			image: '/maps/lotus.webp'
		},
		pearl: {
			name: 'Pearl',
			image: '/maps/pearl.jpg'
		},
		sunset: {
			name: 'Sunset',
			image: '/maps/sunset.png'
		}
	};
	// TODO: get this from servers

	let matchState = $state.raw<Extract<WSResponse, { type: 'MATCH.NEW_STATE' }>['payload'] | null>(
		null
	);
	let MapPicks = $derived.by(() =>
		matchState ? MatchMapPicks.fromJson(matchState.mapPicks) : null
	);
	let player = $derived.by(() => ({
		side: matchState?.canParticipate ? (matchState.amIT1 ? ('t1' as const) : ('t2' as const)) : null
	}));

	onMount(() => {
		const ws = new WebSocket(`ws://localhost:3000/ws/${params.matchId}`);

		ws.onopen = () => {
			console.log('WebSocket connection opened');
			ws.send('Hello Server!');
		};

		ws.onmessage = (event) => {
			console.log('Message from server:', event.data);

			const res = SuperJSON.parse(event.data);

			// console.log(res);
			// try {
			// 	typia.assert<WSResponse>(res);
			// } catch (e) {
			// 	console.log(e);
			// }
			if (!typia.is<WSResponse>(res)) return;

			if (res.type === 'MATCH.NEW_STATE') matchState = { ...res.payload };
		};
	});

	$effect(() => {
		console.log('MatchState Change', matchState);
	});
</script>

<div class="grid h-screen w-full place-items-center">
	<main class="h-full w-full max-w-5xl rounded-lg px-8 py-16">
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

		{#if matchState}
			<div class="mt-16 flex w-full flex-row justify-between gap-x-16">
				<div class="w-3/4">
					<header class="text-left">
						<p class="flex flex-row items-center gap-x-2 text-xl font-semibold">
							{matchState[player.side ?? 't1'].name}
							{player?.side ? '(You)' : ''}
							<svg
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
						<p class="mt-1 text-sm text-neutral-500">{player?.side ?? 't2'}, Choosing a map...</p>
					</header>
					{#if matchState.canParticipate && player.side}
						<div>
							<main class="mt-8">
								<p class="text-base font-medium">Pick a Map to Veto / Select</p>
								<!-- grid w-full auto-cols-auto grid-flow-col  -->
								<div class="mt-4 flex flex-row flex-wrap items-center gap-2">
									{#each Object.entries(MAPS) as [key, { name, image }] (key)}
										<div class="w-24 cursor-pointer rounded-lg hover:ring-2 hover:ring-blue-500">
											<img src={image} alt={name} class="size-24 object-cover" draggable="false" />
											<p class="mt-0.5 py-0.5 text-sm font-normal text-neutral-500">{name}</p>
										</div>
									{/each}
								</div>
							</main>
							<footer class="mt-8">
								<div class="flex flex-row items-center justify-end gap-x-3">
									<button
										type="button"
										class="cursor-pointer rounded-lg bg-red-200 px-4 py-1.5 font-medium text-red-800"
										>Lock In</button
									>
								</div>
							</footer>
						</div>
						<div class="grayscale-100 opacity-40">
							<main class="mt-8">
								<p class="text-base font-semibold">Pick a Side for Ascent</p>
								<div class="mt-4 flex flex-row items-center gap-x-3">
									<button
										type="button"
										class="cursor-pointer rounded-lg bg-red-200 px-4 py-1 text-sm text-red-900"
										>Attack</button
									>
									<button
										type="button"
										class="cursor-pointer rounded-lg bg-blue-200 px-4 py-1 text-sm text-blue-900"
										>Defense</button
									>
								</div>
							</main>
							<footer class="mt-8">
								<div class="flex flex-row items-center justify-end gap-x-3">
									<button
										type="button"
										class="cursor-pointer rounded-lg bg-red-200 px-4 py-1.5 font-medium text-red-800"
										>Lock In</button
									>
								</div>
							</footer>
						</div>{/if}
				</div>
				<div class="rayscale-100 w-1/4 opacity-40">
					<header class="text-right">
						<p class="flex flex-row items-center justify-end gap-x-2 text-xl font-semibold">
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
			</div>{/if}
	</main>
</div>
