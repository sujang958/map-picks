<script lang="ts">
	import MapPick from '$lib/components/MapPick.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { PageProps } from './$types';
	import typia from 'typia';
	import type { WSRequest, WSResponse } from '@self/types/ws';
	import { MatchMapPicks, type JSONMatchMapPicks, type Side } from '@self/core';
	import SuperJSON from 'superjson';

	let { params }: PageProps = $props();

	const MAPS: Record<string, { name: string; image: string }> = {
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

	let matchState = $state<Extract<WSResponse, { type: 'MATCH.NEW_STATE' }>['payload'] | null>(null);
	let matchParticipation = $state<null | { canParticipate: boolean; amIT1: boolean }>(null);
	let MapPicks = $derived.by(() =>
		matchState ? MatchMapPicks.fromJson(matchState.mapPicks) : null
	);
	let player = $derived.by(() => ({
		side: matchParticipation?.canParticipate
			? matchParticipation.amIT1
				? ('t1' as const)
				: ('t2' as const)
			: null
	}));
	let pov = $derived.by(() =>
		matchParticipation?.canParticipate && player?.side
			? {
					my: player.side,
					opponent: player.side == 't1' ? ('t2' as const) : ('t1' as const)
				}
			: { my: 't1' as const, opponent: 't2' as const }
	);
	let isMyTurn = $derived(pov.my == 't1' ? MapPicks?.isT1Turn : !MapPicks?.isT1Turn);
	// let isMyTurn = $derived(
	// 	((player?.side ?? 't1') == 't1' && MapPicks?.isT1Turn) ||
	// 		(player?.side == 't2' && !MapPicks?.isT1Turn)
	// );

	let ws: WebSocket;

	onMount(() => {
		ws = new WebSocket(`ws://localhost:3000/ws/${params.matchId}`);

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
			if (res.type === 'MATCH.PARTICIPATE') matchParticipation = { ...res.payload };
		};
	});

	$effect(() => {
		console.log(new Date(), 'MatchState Change', matchState, MapPicks?.isT1Turn, player, isMyTurn);
	});

	let selectedDecision = $state<Side | string>('');

	const makeDecision = () => {
		if (selectedDecision.replaceAll(' ', '').length <= 0) return;
		if (!MapPicks?.timeTo) return;
		if (!matchParticipation?.canParticipate) return;

		const { to, who } = MapPicks.timeTo;
		if (player.side?.toUpperCase() !== who) return;

		if (to != 'PICK_SIDE') {
			const req = {
				type: 'MATCH.DECISION_MADE',
				payload: {
					type: to,
					decision: selectedDecision
				}
			} satisfies WSRequest;

			ws.send(SuperJSON.stringify(req));
		} else if (to == 'PICK_SIDE' && typia.is<Side>(selectedDecision)) {
			const req = {
				type: 'MATCH.DECISION_MADE',
				payload: {
					type: to,
					decision: selectedDecision
				}
			} satisfies WSRequest;

			ws.send(SuperJSON.stringify(req));
		}
	};
</script>

<div class="grid h-screen w-full place-items-center">
	<main class="h-full w-full max-w-5xl rounded-lg px-8 py-16">
		<h1 class="text-3xl font-semibold">Bo3 Map Picks</h1>
		<h1 class="mt-2 text-base text-neutral-500">Time Limit 10:00</h1>
		{#if MapPicks}
			<div class="mt-8 grid grid-cols-7">
				<MapPick team="T1" active map={MAPS[MapPicks.t1Veto[0]?.map.toLowerCase() ?? '']?.image} />
				<MapPick team="T2" map={MAPS[MapPicks.t2Veto[0]?.map.toLowerCase() ?? '']?.image} />

				<MapPick
					team="T1"
					type="Select"
					enemyTeam="T2"
					enemyPicks={MapPicks.t1Select[0]?.enemyTeamPick ?? 'WAITING...'}
					map={MAPS[MapPicks.t1Select[0]?.map.toLowerCase() ?? '']?.image}
				/>
				<MapPick
					team="T2"
					type="Select"
					enemyTeam="T1"
					enemyPicks={MapPicks.t2Select[0]?.enemyTeamPick ?? 'WAITING...'}
					map={MAPS[MapPicks.t2Select[0]?.map.toLowerCase() ?? '']?.image}
				/>
				<MapPick
					team="T1"
					type="Veto"
					map={MAPS[MapPicks.t1Veto[1]?.map.toLowerCase() ?? '']?.image}
				/>
				<MapPick
					team="T2"
					type="Veto"
					map={MAPS[MapPicks.t2Veto[1]?.map.toLowerCase() ?? '']?.image}
				/>
				<MapPick team="" type="Remainder" enemyTeam="T1" />
			</div>
		{/if}

		{#if matchState}
			<div class="mt-16 flex w-full select-none flex-row justify-between gap-x-16">
				<!-- Left, my -->
				<div class="w-3/4">
					<header class="text-left">
						<p class="-mt-4 w-min rounded-xl bg-blue-300 px-4 py-0.5 text-xs text-blue-800">Me</p>

						<div
							class={!isMyTurn ? 'grayscale-100 pointer-events-none cursor-none opacity-40' : ''}
						>
							<p
								class="mt-2 flex flex-row items-center gap-x-2 text-xl font-semibold opacity-100 grayscale-0"
							>
								{matchState[player.side ?? 't1'].name}
								{player?.side ? '(Me)' : ''}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="size-3 fill-red-800 {!isMyTurn ? 'opacity-0' : 'opacity-100'}"
								>
									<path
										d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z"
									/>
								</svg>
							</p>
							<p class="mt-1 text-sm text-neutral-500">
								{player?.side ?? 't2'}, {isMyTurn ? 'Pondering...' : 'Waiting...'}
							</p>
						</div>
					</header>
					{#if matchParticipation?.canParticipate && player.side && isMyTurn && MapPicks?.timeTo}
						<main
							class="mt-8 {!isMyTurn
								? 'grayscale-100 pointer-events-none cursor-none opacity-40'
								: ''}"
						>
							{#if MapPicks?.timeTo?.to !== 'PICK_SIDE'}
								<p class="text-base font-medium">
									Pick a Map to {{ VETO_MAP: 'Veto', SELECT_MAP: 'Select' }[MapPicks.timeTo.to]}
								</p>
								<!-- grid w-full auto-cols-auto grid-flow-col  -->
								<div class="mt-4 flex flex-row flex-wrap items-center gap-2">
									{#each Object.entries(MAPS).filter((map) => MapPicks?.availableMaps
											.map((v) => v.toUpperCase())
											.includes(map[1].name.toUpperCase())) as [key, { name, image }] (key)}
										<button
											type="button"
											class="w-24 cursor-pointer overflow-hidden rounded-lg transition duration-150 {selectedDecision ==
											name
												? 'bg-neutral-200 ring-4 ring-red-900 ring-offset-2'
												: 'ring-offset-2 hover:ring-4 hover:ring-black'}"
											onclick={() => (selectedDecision = name)}
										>
											<img src={image} alt={name} class="size-24 object-cover" draggable="false" />
											<p class="py-0.5 text-sm font-normal text-neutral-500">{name}</p>
										</button>
									{/each}
								</div>
							{:else}
								<p class="text-base font-semibold">
									Pick a Side for {MapPicks.lastSelectedMap?.map.map}
								</p>
								<div class="mt-4 flex flex-row items-center gap-x-3">
									<button
										type="button"
										onclick={() => (selectedDecision = 'ATTACK')}
										class="cursor-pointer rounded-lg bg-red-200 px-4 py-1 text-sm text-red-900 {selectedDecision ==
										'ATTACK'
											? 'ring-4 ring-red-900 ring-offset-2'
											: ''}">Attack</button
									>
									<button
										type="button"
										onclick={() => (selectedDecision = 'DEFENSE')}
										class="cursor-pointer rounded-lg bg-blue-200 px-4 py-1 text-sm text-blue-900 {selectedDecision ==
										'DEFENSE'
											? 'ring-4 ring-blue-900 ring-offset-2'
											: ''}">Defense</button
									>
								</div>
							{/if}
						</main>
						<footer class="mt-8">
							<div class="flex flex-row items-center justify-end gap-x-3">
								<button
									type="button"
									onclick={() => makeDecision()}
									class="cursor-pointer rounded-lg bg-red-200 px-4 py-1.5 text-sm font-medium text-red-800 transition duration-200 hover:opacity-80"
									>Lock In</button
								>
							</div>
						</footer>
					{/if}
				</div>

				<!-- Right, opponent -->
				<div class={isMyTurn ? 'grayscale-100 pointer-events-none cursor-none opacity-40' : ''}>
					<header class="text-right">
						<p class="flex flex-row items-center justify-end gap-x-2 text-xl font-semibold">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="size-3 fill-red-800 {isMyTurn ? 'opacity-0' : 'opacity-100'}"
							>
								<path
									d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z"
								/>
							</svg>
							{matchState[pov.opponent].name}
						</p>
						<p class="mt-1 text-sm text-neutral-500">
							{pov.opponent}, {isMyTurn ? 'Waiting...' : 'Pondering...'}
						</p>
					</header>
				</div>
			</div>{/if}
	</main>
</div>
