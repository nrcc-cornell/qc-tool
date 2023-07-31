<script>
	export let loggedIn, user, handleLogin;
</script>

{#if loggedIn}
	<div class="flex flex-row bg-base-300 p-2 items-center max-h-20 h-16" id="login-container">
		<div class="text-xl font-medium mr-10 ml-8">
			Welcome {user.username}! Please make QC changes on the left, using the map on the right as a
			reference. When finished, please press 'Submit'!
		</div>
	</div>
{:else}
	<div class="flex flex-row bg-base-300 p-2 items-center max-h-20 h-16" id="login-container">
		<div class="text-xl font-medium mr-10 ml-8">Welcome! Please Log in here:</div>
		<input
			type="text"
			placeholder="Username"
			class="input input-bordered w-full max-w-xs mx-2"
			bind:value={user.username}
		/>
		<input
			type="password"
			placeholder="Password"
			class="input input-bordered w-full max-w-xs mx-2"
			bind:value={user.password}
		/>
		<select class="select select-bordered w-full max-w-xs mx-2" bind:value={user.org}>
			<option disabled selected>Select One</option>
			<option>HPRCC</option>
			<option>MRCC</option>
			<option>NRCC</option>
			<option>SERCC</option>
			<option>SRCC</option>
			<option>WRCC</option>
		</select>
		<button class="btn btn-primary" on:click={handleLogin}>Login</button>
	</div>
{/if}
