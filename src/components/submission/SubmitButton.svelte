<script>
	export let allChangesArray, loggedIn;
</script>

<button
	class={Object.values(allChangesArray).length == 0 || !loggedIn
		? 'btn w-full btn-primary btn-disabled'
		: 'btn w-full btn-primary'}
	onclick="my_modal_1.showModal()">Submit</button
>
<dialog id="my_modal_1" class="modal">
	<form method="dialog" class="modal-box">
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
		<h3 class="text-2xl font-bold text-gray-900 dark:text-white pb-4">
			Are you sure you would like to submit the following changes:
		</h3>
		{#each Object.entries(allChangesArray) as [date, changes], i}
			{#if Object.values(changes).length != 0}
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white pb-2">
					{date}
				</h2>
				{#each changes as change, i}
					{#if typeof change !== 'undefined'}
						<p class="text-base text-gray-900 dark:text-white">
							{change.sId +
								' ' +
								(change.tx === null
									? ''
									: 'TX; ' + change.data[0] + '~! -> ' + change.data[0] + (change.tx ? '!' : '')) +
								' ' +
								(change.tn === null
									? ''
									: 'TN; ' + change.data[1] + '~! -> ' + change.data[1] + (change.tn ? '!' : '')) +
								' ' +
								(change.ta === null
									? ''
									: 'TA; ' + change.data[2] + '~! -> ' + change.data[2] + (change.ta ? '!' : '')) +
								' ' +
								(change.pp === null
									? ''
									: 'PP; ' + change.data[3] + '~! -> ' + change.data[3] + (change.pp ? '!' : ''))}
						</p>
					{/if}
				{/each}
				<div class="divider" />
			{/if}
		{/each}
		<div class="modal-action">
			<button class="btn btn-primary">Submit</button>
		</div>
	</form>
</dialog>
