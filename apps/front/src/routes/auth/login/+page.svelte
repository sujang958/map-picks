<script lang="ts">
	import toast from 'svelte-french-toast';

	let teamName: string = '';
	let password: string = '';

	let loggedIn = $state(null);
	let loading = $state(false);

	const login = async () => {
		loading = true;

		try {
			const res = await fetch(`http://localhost:3000/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ teamName, password })
			});

			console.log('asdfa');
			const body = await res.json();

			console.log(body);

			if (body?.error) return toast.error('Wrong');

			loggedIn = body.message;
		} catch (e) {
			console.log(e);
		} finally {
			loading = false;
		}
	};
</script>

<div class="grid h-screen w-full place-items-center p-8">
	<main
		class="flex w-full max-w-sm flex-col items-start p-6 {loading
			? 'pointer-events-none cursor-none opacity-30'
			: ''}"
	>
		{#if loggedIn}
			<p class="text-lg font-semibold">{loggedIn}</p>
		{:else}
			<p class="text-xl font-semibold">Login</p>
			<div class="py-1"></div>

			<label class="mt-4 flex w-full flex-col items-start gap-y-1">
				Team Name
				<input
					type="text"
					bind:value={teamName}
					class="mt-0.5 w-full rounded-lg border border-neutral-300 px-2.5 py-1"
					placeholder="25/2-3"
				/>
			</label>
			<label class="mt-4 flex w-full flex-col items-start gap-y-1">
				Password
				<input
					type="password"
					bind:value={password}
					class="mt-0.5 w-full rounded-lg border border-neutral-300 px-2.5 py-1"
					placeholder="secret"
				/>
			</label>
			<button
				type="button"
				onclick={() => login()}
				class="ml-auto mt-5 cursor-pointer rounded-lg bg-neutral-950 px-4 py-1.5 text-sm text-white transition-opacity duration-200 hover:opacity-80"
				>Login</button
			>
		{/if}
	</main>
</div>
