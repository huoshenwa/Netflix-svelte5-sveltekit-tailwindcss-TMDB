<script lang="ts">
    import { page } from "$app/stores";
    import Player from "$lib/components/Player.svelte";
    import { cardState } from "$lib/store/GlobalState";

    let videoId: string = $derived($page.params.id);

    let trailerURL: { key: string } | null = $state(null);
    let loading: boolean = $state(false);
    let error: string = $state("");
    let fetchedVideoId: string | null = $state(null);

    $effect(() => {
        if (videoId && videoId !== fetchedVideoId) {
            fetchedVideoId = videoId;

            cardState.update((state) => ({
                ...state,
                isHovered: false,
                item: null,
                position: { x: -500, y: 0 },
            }));

            (async () => {
                loading = true;
                error = "";
                trailerURL = null;

                try {
                    const response = await fetch(`/api/trailer/${videoId}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    if (!response.ok) {
                        throw new Error("Failed to fetch video trailer");
                    }

                    const data = await response.json();

                    if (data.trailer && data.trailer.key) {
                        trailerURL = data.trailer;
                    } else {
                        error = "No Trailer Found...";
                    }
                } catch (error) {
                    error = "No Trailer Found...";
                } finally {
                    loading = false;
                }
            })();
        }
    });
</script>

<div>
    {#if loading}
        <p class="absolute top-28 left-12 w-full text-white">
            Loading Trailer...
        </p>
    {:else if trailerURL}
        <Player isMuted={false} showControls={true} videoId={trailerURL.key} />
    {:else if error}
        <p class="absolute top-28 left-12 w-full text-white">{error}</p>
    {:else}
        <p class="absolute top-28 left-12 w-full text-white">
            No Trailer Found...
        </p>
    {/if}
</div>
