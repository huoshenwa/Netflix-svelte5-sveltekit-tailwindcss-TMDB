<script lang="ts">
    import { goto } from "$app/navigation";
    import { popularMovies, selectedMovie,openModal} from "$lib/store/GlobalState";
    import { fetchTrailer } from "$lib/utils/helpers";
    import { Info, Play, Volume2, VolumeOff } from "lucide-svelte";
    import { onDestroy, onMount } from "svelte";
    import Player from "./Player.svelte";
    import type PlayerComponent from "./Player.svelte";
    let unsubscribeMovies: () => void;
    let movie: MovieDetails;
    let trailerURL: string = "";
    let playerRef: PlayerComponent | null = null;
    let playerMuted: boolean = true;
    onMount(() => {
        unsubscribeMovies = selectedMovie.subscribe(async (data) => {
            // console.log("data::", data);
            movie = data;

            trailerURL = await fetchTrailer(movie?.id);

        });
    });
    onDestroy(() => {
        unsubscribeMovies?.(); // 在 SSR时不会调用onMount所以使用可选链，跳过unsubscribeMovies为undefind或null的情况
    });


    const handleMute = () => {
        playerMuted = true;
    };

    const handleUnmute = () => {
        playerMuted = false;
    };
</script>

<main class="relative overflow-hidden">
    <!-- VidioPlayer -->

    {#if trailerURL}
        <Player
            bind:this={playerRef}
            onmute={handleMute}
            onunmute={handleUnmute}
            videoId={trailerURL}
        />
    {/if}
    <!--会被服务器渲染，只不过src属性会产生一个无效的图片 URL： <img src={`http://image.tmdb.org/t/p/original${movie?.backdrop_path}`} alt="movie backdrop" /> -->
    {#if movie && !trailerURL}
        <img
            src={`http://image.tmdb.org/t/p/original${movie?.backdrop_path}`}
            alt="movie backdrop"
        />
    {/if}
    <!-- gradient overlay -->
    <div
        class="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent"
    ></div>

    {#if trailerURL}
        <div
            class="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent"
        ></div>
    {/if}

    <!-- movie details -->
    {#if movie}
        <div class="absolute top-[45%] pl-12 w-full z-10">
            <h1 class="text-4xl md:text-6xl font-bold mb-4 text-white">
                {movie.title}
            </h1>

            <p
                class="text-sm md:text-lg hidden md:block mb-6 max-w-lg text-gray-300"
            >
                {movie.overview?.substring(0, 150) + "..."}
            </p>
            <div class="flex flex-wrap items-center">
                <div class="flex gap-4">
                    <button
                        onclick={() => {
                            goto(`/watch/${movie.id}`);
                        }}
                        class="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition"
                    >
                        <Play size={20} />
                        <span class="font-semibold">Play</span>
                    </button>

                    <button
                        onclick={() => {
                            console.log('点击到了');
                            
                            openModal(trailerURL, movie.id.toString());
                        }}
                        class="flex items-center gap-2 bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition"
                    >
                        <Info size={20} />
                        <span class="font-semibold">More Info</span>
                    </button>
                </div>

                <div class="absolute right-0 flex items-center gap-4">
                    <button
                        onclick={() => {
                            if (playerRef) {
                                playerRef.toggleMute();
                            }
                        }}
                        class="flex items-center p-4 border-2 text-white rounded-full transition"
                    >
                        {#if playerMuted}
                            <VolumeOff size={20} />
                        {:else}
                            <Volume2 size={20} />
                        {/if}
                    </button>

                    <div
                        class="bg-gray-600 bg-opacity-60 text-white border-l-2 px-3 py-2"
                    >
                        <span>18+</span>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</main>
