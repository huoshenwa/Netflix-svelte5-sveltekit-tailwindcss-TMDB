<script lang="ts">
    import { goto } from "$app/navigation";
    import {
        Check,
        Play,
        Plus,
        ThumbsUp,
        Volume2,
        VolumeOff,
    } from "lucide-svelte";
    import Player from "./Player.svelte";
    import { addedToFavoriteList, convertMinsToHrs } from "$lib/utils/helpers";
    import { closeModal, modalStore } from "$lib/store/GlobalState";
    import type PlayerComponent from "./Player.svelte";
    import SimilarMovieCard from "./SimilarMovieCard.svelte";
    import { untrack } from "svelte";

    let modalState = $derived($modalStore);

    let isOpen: boolean = false;

    let animationClass: string = $state("");

    let movieData: MovieDetails | null = $state(null);

    let videoId: string = $state("das");

    let addedToFav: boolean = $state(false);

    let muted: boolean = $state(false);

    let shouldRender: boolean = $state(true);

    let similarMovies: Movie[] = $state([]);

    let loadingSimilarMovies: boolean = $state(false);

    let errorLoadingSimilar: boolean = $state(false);

    let player: PlayerComponent | null=$state(null);

    $effect(() => {
        console.log('是这里搞鬼');
        
        if (modalState.isOpen) {
            untrack(()=>{
                if (!shouldRender) {
                    shouldRender = true;
                    animationClass = "bounce-up";
                    muted = false;
    
                    if (typeof document !== "undefined") {
                        document.body.style.overflow = "hidden";
                    }
                }
    
                isOpen = modalState.isOpen;
    
                videoId = modalState.videoId;
    
                movieData = modalState.movieData;
    
                fetchSimilarMovies(movieData?.id!);
            })
        } else if (shouldRender) {
            untrack(()=>{
                animationClass = "bounce-down";
    
                setTimeout(() => {
                    shouldRender = false;
    
                    if (typeof document !== "undefined") {
                        document.body.style.overflow = "";
                    }
                }, 300);

            })
        }
        
    });

    const fetchSimilarMovies = async (movieId: number) => {
        loadingSimilarMovies = true;
        errorLoadingSimilar = false;

        try {
            const response = await fetch(`/api/movie/${movieId}/similar`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            similarMovies = data.similarMovies || [];

            const allFavList: Movie[] = JSON.parse(
                localStorage.getItem("list") || "[]",
            );

            addedToFav = allFavList?.some((m) => m.id == movieId);

            console.log("similar movies", similarMovies);
        } catch (error) {
            similarMovies = [];
            errorLoadingSimilar = true;
        } finally {
            loadingSimilarMovies = false;
        }
    };

    const handleModalClose = () => {
        closeModal();
    };

    const handleAddToFav = () => {
        const { id, backdrop_path, title } = movieData!;

        const favData = {
            id,
            backdrop_path,
            title,
            image: `http://image.tmdb.org/t/p/w500${backdrop_path}`,
        };

        addedToFavoriteList(favData);
        addedToFav = !addedToFav;
    };

    const toggleMuteVideo = () => {
        if (player) {
            muted = !muted;
            player.toggleMute();
        }
    };
</script>

{#if shouldRender}
    <div class="overlay">
        <div
            role="presentation"
            class={`modal-content w-[90%] md:w-[80%] lg:w-[50%] ${animationClass}`}
            onclick={(e)=>{e.stopPropagation()}}
        >
            <button
                class="close-button"
                onclick={handleModalClose}
                aria-label="Close Modal"
            >
                &times;
            </button>

            <div class="content">
                {#if videoId}
                    <div class="pointer-events-none overflow-hidden relative">
                        <!-- gradient overlay -->
                        <div
                            class="absolute z-30 inset-0 bottom-0 bg-gradient-to-t from-[#141414] to-transparent"
                        ></div>

                        <div
                            class="absolute pointer-events-auto z-50 left-6 md:left-12 bottom-[0px] w-[90%]"
                        >
                            <p class="text-white font-bold mb-4 text-4xl">
                                {movieData?.original_title}
                            </p>

                            <div class="flex justify-between w-full">
                                <div class="flex gap-4">
                                    <button
                                        class="flex text-2xl items-center gap-2 bg-white text-black px-12 py-2 rounded-md hover:bg-gray-200 transition"
                                        onclick={() => {
                                            goto(`/watch/${movieData?.id}`);
                                            handleModalClose();
                                        }}
                                    >
                                        <Play size={20} />
                                        <span
                                            class="hidden md:block font-semibold"
                                            >Play</span
                                        >
                                    </button>

                                    <button
                                        class="rounded-full transition-colors duration-200 p-3 border-2 border-gray-700 hover:border-white"
                                        onclick={handleAddToFav}
                                    >
                                        {#if addedToFav}
                                            <Check class="text-white h-6 w-6" />
                                        {:else}
                                            <Plus class="text-white h-6 w-6" />
                                        {/if}
                                    </button>

                                    <button
                                        class="rounded-full transition-colors duration-200 p-3 border-2 border-gray-700 hover:border-white"
                                    >
                                        <ThumbsUp class="text-white h-6 w-6" />
                                    </button>
                                </div>
                                <button
                                    onclick={toggleMuteVideo}
                                    class="rounded-full transition-colors
                duration-200 p-3 border-2 border-gray-700 hover:border-white"
                                >
                                    {#if muted}
                                        <VolumeOff />
                                    {:else}
                                        <Volume2 />
                                    {/if}
                                </button>
                            </div>
                        </div>

                        {#if videoId}
                            <Player
                                bind:this={player}
                                {videoId}
                                isMuted={muted}
                            />
                        {:else}
                            <div
                                class="flex justify-center items-center h-64 bg-gray-800"
                            >
                                <p class="text-white">Video Unavailable...</p>
                            </div>
                        {/if}

                        {#if movieData}
                            <div
                                class="absolute botton-0 px-12 w-full z-50 pointer-events-auto"
                            ></div>
                        {/if}
                    </div>
                {:else}
                    <div
                        class="flex justify-center items-center h-64 bg-gray-800"
                    >
                        <p class="text-white">
                            Video not avaiable for this movie...
                        </p>
                    </div>
                {/if}

                <!-- Actual Movie Content -->

                <div class="relative pt-6 px-6 md:px-12">
                    <div
                        class="absolute z-30 h-[20px] inset-0 bottom-0 bg-gradient-to-b from-[#141414] to-transparent"
                    ></div>

                    <div class="flex-col flex lg:flex-row">
                        <div class="flex items-center flex-1 gap-3">
                            <span class="text-green-400"
                                >{movieData?.vote_average
                                    ? `${(movieData?.vote_average * 10).toFixed(0)}% Match`
                                    : "N/A"}</span
                            >

                            <span
                                class="border-gray-600 border-2 rounded-sm text-sm"
                                >{movieData?.adult ? "18+" : "13+"}</span
                            >

                            <span class="font-bold"
                                >{movieData?.runtime
                                    ? convertMinsToHrs(movieData?.runtime)
                                    : "N/A"}
                            </span>

                            <span
                                class="border-gray-700 border-2 rounded-sm text-sm"
                                >4K</span
                            >
                        </div>

                        <div class="flex-col flex-1">
                            <div class="flex lg:ml-40">
                                {#if movieData?.genres && Array.isArray(movieData?.genres) && movieData?.genres.length > 0}
                                    <span class="font-semibold"
                                        >Genre:&nbsp;</span
                                    >
                                    {#each movieData.genres.slice(0, 3) as genre}
                                        <span class="mr-2">{genre.name}</span>
                                    {/each}
                                {:else}
                                    <span class="font-semibold">Genre: N/A</span
                                    >
                                {/if}
                            </div>

                            <div class="flex lg:ml-40 mt-2">
                                <span class="font-semibold"
                                    >Avaiable in: &nbsp;</span
                                >

                                {#if movieData?.spoken_languages && Array.isArray(movieData?.spoken_languages) && movieData?.spoken_languages.length > 0}
                                    {#each movieData.spoken_languages as lang}
                                        <span class="mr-2">{lang.name}</span>
                                    {/each}
                                {:else}
                                    <span class="font-semibold">N/A</span>
                                {/if}
                            </div>
                        </div>
                    </div>
                    <div class="relative w-full lg:w-1/2 mt-2">
                        <p>
                            {movieData?.overview ||
                                "No overview is avaiable for the movie."}
                        </p>
                    </div>

                    {#if loadingSimilarMovies}
                        <div class="mt-4">
                            <p class="text-center">Loading Similar Movies...</p>
                        </div>
                    {:else if errorLoadingSimilar}
                        <div class="mt-4">
                            <p class="text-center text-red-500">
                                Error loading Similar Movies...
                            </p>
                        </div>
                    {:else if similarMovies.length > 0}
                        <div>
                            <h1 class="text-2xl my-4 font-bold">
                                More Like This
                            </h1>
                            <div
                                class="flex flex-wrap sm:justify-between justify-center gap-x-4 gap-y-8"
                            >
                                {#each similarMovies.slice(0, 12) as item}
                                    <!-- custom card -->
                                    <SimilarMovieCard
                                        description={item.overview}
                                        id={item.id.toString()}
                                        title={item.title}
                                        imageUrl={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`}
                                    />
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding-top: 4rem;
        z-index: 50;
    }

    .content {
        position: relative;
        background-color: rgb(20, 20, 20);
        color: white;
        box-shadow:
            rgba(0, 0, 0, 0.2) 0px 2px 1px 1px,
            rgba(0, 0, 0, 0.14) 0px 1px 1px 0px,
            rgba(0, 0, 0, 0.12) 0px 1px 3px 0px;

        background-image: linear-gradient(
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.05)
        );
    }

    .modal-content {
        background-color: white;
        position: relative;
        max-height: 90vh;
        height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        border-radius: 0.5rem;
    }

    .modal-content::-webkit-scrollbar {
        width: 0;
    }

    .modal-content::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }

    .close-button {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1.5rem;
        height: 1.5rem;
        width: 1rem;
        font-size: 1.2rem;
        top: 0.75rem;
        right: 0.75rem;
        background: black;
        color: white;
        border-radius: 50%;
        cursor: pointer;
        z-index: 50;
    }
</style>
