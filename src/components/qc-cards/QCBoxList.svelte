<script>
	import { Accordion, AccordionItem } from 'svelte-collapsible';
	export let data;
	let dataorder = ['TX', 'TN', 'TA', 'PP'];
</script>

<ul>
	<Accordion>
		{#each data.item as { nIds, uid, elev, sId, ll, postal, data, slimit, name }, n}
			<AccordionItem key={String.fromCharCode(97 + n)}>
				<h2 slot="header">{postal + ' ' + name}</h2>
				<div slot="body">
					{#each data as [qcdatafigure, num1, num2], i}
						{#if dataorder[i] == 'PP'}
							{#if qcdatafigure > slimit.PP}
								<p>{dataorder[i]}</p>
								<p>{qcdatafigure + '~! (' + 0 + ', ' + slimit[dataorder[i]] + ')'}</p>
							{/if}
						{:else if qcdatafigure < slimit[dataorder[i]][0] || qcdatafigure > slimit[dataorder[i]][1]}
							<p>{dataorder[i]}</p>
							<p>
								{qcdatafigure +
									'~! (' +
									slimit[dataorder[i]][0] +
									', ' +
									slimit[dataorder[i]][1] +
									')'}
							</p>
						{/if}
					{/each}
				</div>
			</AccordionItem>
		{/each}
	</Accordion>
</ul>
