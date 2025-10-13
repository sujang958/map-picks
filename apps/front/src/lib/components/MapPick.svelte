<script lang="ts">
	let { type = 'Veto', team = 'T1', enemyTeam = null, enemyPicks = 'DEFENSE', map = "" } = $props();
</script>

<div class="relative flex h-44 flex-col gap-y-2 bg-[url(/split.avif)] bg-contain text-white">
	<p class="z-50 bg-black p-1.5 text-center text-sm font-medium text-white">{team} {type}</p>
	<!-- <div><img src="/split.avif" alt="" /></div> -->
	{#if type.toUpperCase() == 'VETO'}
		<div class="absolute inset-0 z-10 bg-black/50">&nbsp;</div>
	{/if}

	{#if enemyTeam}
		<p class="z-50 mt-auto w-full bg-black p-3 text-center text-xs text-white">
			{enemyTeam} PICKS {enemyPicks}
		</p>
	{/if}
</div>
