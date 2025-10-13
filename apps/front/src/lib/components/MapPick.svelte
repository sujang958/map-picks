<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let {
		type = 'Veto',
		team = 'T1',
		enemyTeam = null,
		enemyPicks = 'DEFENSE',
		map = '',
		active = false
	} = $props();
</script>

<div
	class={twMerge('relative flex h-44 flex-col gap-y-2 bg-[url(/split.avif)] bg-contain text-white')}
>
	<p class="z-40 bg-black p-1.5 text-center text-xs font-medium text-white">{team} {type}</p>
	<!-- <div><img src="/split.avif" alt="" /></div> -->
	{#if type.toUpperCase() == 'VETO'}
		<div class="absolute inset-0 z-10 bg-black/50">&nbsp;</div>
	{/if}

	{#if enemyTeam}
		<p class="z-40 mt-auto w-full bg-black p-3 text-center text-xs font-medium text-white">
			{enemyTeam} PICKS <br />{enemyPicks}
		</p>
	{/if}

	{#if active}
		<div class="pointer-events-none absolute -inset-0.5 z-50 border-4 border-blue-400 rounded-lg"></div>
	{/if}
</div>
