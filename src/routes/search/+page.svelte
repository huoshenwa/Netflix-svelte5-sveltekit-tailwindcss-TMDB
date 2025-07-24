<script lang="ts">
    import Card from "$lib/components/Card.svelte";

    let { data } = $props();

    console.log(data);
</script>

<div class="absolute top-36 w-screen">
    {#if data.query === ""}
        <p>Please search with a valid query</p>
    {:else if data.results.length === 0}
        <p class="text-red-500 absolute left-12">
            No results found for "{data.query}"
        </p>
    {:else}
        <div class="absolute flex flex-wrap left-12  gap-4">
            {#each data.results as item}
                <Card {item} />
            {/each}
        </div>
    {/if}
</div>
