<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import { favouriteListRefresh } from "$lib/store/GlobalState";
    // import { favouriteListRefresh } from "$lib/store/GlobalState";
    import { onMount } from "svelte";

    let movies : Movie[]  = []


    onMount(()=>{
        movies = JSON.parse(localStorage.getItem('list') || "[]")


        const unSub = favouriteListRefresh.subscribe(()=>{
            movies = JSON.parse(localStorage.getItem('list') || "[]")
        })

        return () => unSub() // Unsubscribe when component is destroyed to avoid memory leaks
    })
</script>





<div class="absolute top-36 flex flex-wrap left-12 gap-4">

    {#if movies.length}
        {#each movies as item }
            <Card {item}/>
        {/each}
    {:else}
    <p class="text-white text-xl">No movies in your list...</p>
    {/if}

</div>