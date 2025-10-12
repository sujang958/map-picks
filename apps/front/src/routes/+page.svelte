<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	onMount(() => {
		const ws = new WebSocket('ws://localhost:3000/ws');

		ws.onopen = () => {
			console.log('WebSocket connection opened');
			ws.send('Hello Server!');
		};
	});
</script>

hi
