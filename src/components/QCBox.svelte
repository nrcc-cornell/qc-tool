<article class="qc-box">
	<h2>
		<slot name="name">
			<span class="missing">Unknown name</span>
		</slot>
	</h2>
</article>

<style>
	.qc-box {
		width: 300px;
		border: 1px solid #aaa;
		border-radius: 2px;
		box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
		padding: 1em;
	}

	h2 {
		padding: 0 0 0 0;
		margin: 0 0 1em 0;
		border-bottom: 1px solid darkgreen;
	}
	.missing {
		color: #999;
	}
</style>
