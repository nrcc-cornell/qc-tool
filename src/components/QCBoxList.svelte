<script>
// @ts-nocheck
    import QCBox from './QCBox.svelte';
	export let data;

</script>

<ul>
	{#each data.item as {nIds, uid, elev, sId, ll, postal, data, slimit, name}}
    <QCBox>
        <span slot="name">
            {postal + " " + name}
        </span>
    </QCBox>
	{/each}
</ul>