<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { page } from '$app/stores';
	import type { ActionData } from './$types';

	export let form: ActionData;
	let loading = false;
	$: isRegister = $page.url.searchParams.get('register') === ''

	const handleSubmit: SubmitFunction = () => {

		loading = true;
		return async ({ result }) => {
			await applyAction(result);
			loading = false;
		};

	};


</script>

<section class="columns max-w-xl mx-auto">
	<div class="column is-half is-offset-one-quarter card">
		<h1>{isRegister ? 'Sign up' : 'Log In'}</h1>
		{#if form?.error}
			<div class="block notification is-danger">{form.error}</div>
		{/if}
		{#if form?.message}
			<div class="block notification is-primary">{form.message}</div>
		{/if}
		<form method="post" use:enhance={handleSubmit} action='?/{isRegister ? 'signup' : 'login'}' class="flex flex-col gap-2">
			{#if isRegister}
				<div class="field">
					<label for="full_name" class="label">Full Name</label>
					<p class="control">
						<input
							id="full_name"
							name="full_name"
							value={form?.values?.full_name ?? ''}
							class="input"
							type="text"
							placeholder="Full Name"
							required
						/>
					</p>
				</div>
			{/if}
			<div class="field">
				<label for="email" class="label">Email</label>
				<p class="control">
					<input
						id="email"
						name="email"
						value={form?.values?.email ?? ''}
						class="input"
						type="email"
						placeholder="Email"
						required
					/>
				</p>
			</div>
			<div class="field">
				<label for="password" class="label">Password</label>
				<p class="control">
					<input
						id="password"
						name="password"
						class="input"
						type="password"
						placeholder="Password"
						required
					/>
				</p>
			</div>
			<div class="mx-auto">
					<button disabled={loading} class="btn btn-filled-primary">{isRegister ? 'Sign up' : 'Log In'}</button>
			</div>
		</form>

		<div class="mt-6">
			<p class="has-text-centered">
				{#if isRegister}
					Already have an account? <a href="/auth">Login</a>
				{:else}
					Don't have an account? <a href="/auth?register">Sign up</a>
				{/if}
			</p>
		</div>
	</div>
</section>


<style>

	@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,200;0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;0,6..72,800;1,6..72,200;1,6..72,300;1,6..72,400;1,6..72,500;1,6..72,600;1,6..72,700;1,6..72,800&display=swap');

	:global(#page-content){
		height: 100vh;
		overflow: visible;
	}

	.field{
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		margin-bottom: 20px;
	}

	input{
		width: 300px;
		border-radius: 5px;
		background: rgba(0,0,0,0.05) !important;
		padding: 10px 15px;
		margin-top: -10px;
	}

	label{
		font-size: 14px;
		display: none;
	}

	h1{
		font-family: 'Libre Baskerville', sans-serif;
		font-size: 24px;
		font-weight: 400;
		margin-bottom: 50px;
	}

	button{
		width: 300px;
	}

	section{
		margin-top: 200px;
		padding: 50px;
		border-radius: 20px;
		background: white;
		box-shadow: 0px 20px 50px rgba(0,0,0,0.05);

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
	}


</style>