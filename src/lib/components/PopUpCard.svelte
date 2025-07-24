<script lang="ts">
    import {
        Check,
        ChevronDown,
        Play,
        Plus,
        ThumbsUp,
        Volume2,
        VolumeOff,
    } from "lucide-svelte";
    import Player from "./Player.svelte";
    import { addedToFavoriteList, fetchTrailer, handleNoImageError } from "$lib/utils/helpers";
    import { onDestroy, onMount } from "svelte";
    import { browser } from "$app/environment";
    import { get } from "svelte/store";
    import type PlayerComponent from "./Player.svelte";
    import { goto } from "$app/navigation";
    import { cardState, openModal } from "$lib/store/GlobalState";

    // external hover
    let { isHovered = false, x = 0, y = 0 } = $props();

    let isPopOverHovered: boolean = $state(false); // internal hover
    let trailerUrl = $state("");
    let imageUrl = $state("");
    let movieId: number;
    let player: PlayerComponent | null = $state(null);
    let showTrailer: boolean = $state(false);
    let title: string = $state("MOVIE");
    let muted: boolean = $state(true);
    let addedToFavorite: boolean = $state(false);
    let favData: Movie;
    let favList: Movie[];
    let showPopover = $derived(isHovered || isPopOverHovered);
    let unSub: () => void;
    let currentMovieId: number | null = null; // 添加这个来防止竞态条件

    // 第一个subscribe：立即更新基本信息（保持原作者的结构）
    cardState.subscribe((data) => {
        if (data.item) {
            imageUrl = `https://image.tmdb.org/t/p/w500${data.item.backdrop_path}`;
            movieId = data.item.id;
            title = data.item.title!;
            favData = data.item;
            currentMovieId = data.item.id; // 更新当前movieId
            showTrailer = false; // 重置showTrailer状态

            // 如果在浏览器环境，处理localStorage
            if (browser) {
                try {
                    favList = JSON.parse(localStorage.getItem('list') || '[]');
                    addedToFavorite = favList?.some((m) => {
                        return m.id === movieId;
                    });
                } catch (error) {
                    favList = [];
                    addedToFavorite = false;
                }
            }
        }
    });

    onMount(async () => {
        if (browser) {
            // 初始化时如果有数据就获取trailer
            if (cardState && get(cardState).item?.id) {
                const initialId = get(cardState).item?.id!;
                currentMovieId = initialId;
                trailerUrl = await fetchTrailer(initialId);
            }

            // 第二个subscribe：只负责异步获取trailer（修复竞态条件）
            unSub = cardState.subscribe(async (state) => {
                if (state.item?.id) {
                    // 异步获取trailer
                    const trailer = await fetchTrailer(state.item?.id);
                    trailerUrl = trailer || "";
                } else {
                    currentMovieId = null;
                    trailerUrl = "";
                }
            });

            // 添加滚动监听
            window.addEventListener("scroll", handleScroll);
        }
    });

    const handleScroll = () => {
        isHovered = false;
        isPopOverHovered = false;
        showTrailer = false;
    };

    const handlePopoverMouseEnter = () => {
        isPopOverHovered = true;
    };

    const handlePopoverMouseLeave = () => {
        isPopOverHovered = false;
        showTrailer = false;
    };

    const handleImageMouseEnter = () => {
        showTrailer = !showTrailer;
    };

    const handleImageMouseEnterAction = () => {
        showTrailer = false;
    };

    const toogleMuteAction = () => {
        if (player) {
            muted = !muted;
            player.toggleMute();
        }
    };

    onDestroy(() => {
        if (browser) {
            window.removeEventListener("scroll", handleScroll);
        }

        if (unSub) {
            unSub();
        }
    });
</script>

<div
    class="popup-card z-40 flex text-white flex-col
 transition-all duration-300 {showPopover
        ? 'popup-scale-up opacity-100'
        : 'popup-scale-down opacity-0'}"
    style="position: fixed; top:{y}px ; left:{x < 200
        ? x + 60
        : browser && window.innerWidth - x < 200
          ? x - 100
          : x}px; width:350px ;z-index:1000;overflow:hidden"
    onmouseenter={handlePopoverMouseEnter}
    onmouseleave={handlePopoverMouseLeave}
    role="presentation"
>
    <div class="relative w-full">
        <div class="flex items-center">
            <p
                class="absolute text-ellipsis z-50 top-36 left-2 font-semibold text-xl"
            >
                {title.length > 25 ? title.substring(0, 25) + "..." : title}
            </p>

            <span
                role="presentation"
                onclick={toogleMuteAction}
                class="absolute cursor-pointer z-50 transition-colors duration-200 top-36 right-4 p-3 border-2 border-gray-700 rounded-full hover:border-white"
            >
                {#if muted}
                    <VolumeOff size={20} />
                {:else}
                    <Volume2 size={20} />
                {/if}
            </span>
        </div>

        {#if trailerUrl && showPopover && showTrailer}
            <div class="pointer-events-none">
                <Player
                    bind:this={player}
                    isMuted={muted}
                    videoId={trailerUrl}
                />
            </div>
        {:else if imageUrl && showPopover}
            <img
                class="w-full h-[200px] object-cover"
                src={imageUrl}
                onerror={handleNoImageError}
                onmouseenter={handleImageMouseEnter}
                alt="Poster"
            />
        {:else}
            <div
                class="w-full h-[200px] bg-gray-500 flex items-center justify-center"
            >
                <span class="text-white text-sm">No Image Avaiable</span>
            </div>
        {/if}
    </div>
    <!-- Action Buttons -->
    <div
        role="presentation"
        onmouseenter={handleImageMouseEnterAction}
        class="flex justify-between items-center p-4"
    >
        <div class="flex space-x-2">
            <button
                onclick={() => {
                    goto(`watch/${movieId}`);
                }}
                class="rounded-full transition-colors duration-200 p-3 border-2 border-gray-700 hover:border-white"
            >
                <Play class="text-white h-6 w-6" /></button
            >

            <button
                onclick={() => {
                    addedToFavorite = !addedToFavorite;
                    addedToFavoriteList(favData);
                }}
                class="rounded-full transition-colors duration-200 p-3 border-2 border-gray-700 hover:border-white"
            >
                {#if addedToFavorite}
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
        onclick={()=>{openModal(trailerUrl,movieId.toString())}}
            class="rounded-full transition-colors duration-200 p-3 border-2 border-gray-700 hover:border-white"
            ><ChevronDown class="text-white h-6 w-6" /></button
        >
    </div>
    <!-- movie info -->

    <div class="p-4">
        <div class="flex gap-3">
            <span class="text-green-400">70% Match</span>
            <span class="border-2 border-gray-600 rounded-sm text-sm">13 +</span
            >
            <span class="font-bold">21m</span>
            <span class="border-2 border-gray-600 rounded-sm text-sm">HD</span>
        </div>
        <div class="mt-2 text-lg flex space-x-2">
            <span>Witty • Heartflet • Drama</span>
        </div>
    </div>
</div>

<style>
    .popup-card {
        background-color: rgb(20, 20, 20);

        box-shadow:
            rgba(0, 0, 0, 0.2) 0px 2px 1px 1px,
            rgba(0, 0, 0, 0.14) 0px 1px 1px 0px,
            rgba(0, 0, 0, 0.12) 0px 1px 3px 1px;

        background-image: linear-gradient(
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.05)
        );

        border-radius: 8px;
        transform-origin: center;
    }

    .popup-scale-down {
        transform: translate(-50%, -100%) scale(0.1);
    }

    .popup-scale-up {
        transform: translate(-50%, -100%) scale(1);
        opacity: 1;
    }

    .transition-all {
        transition:
            transform 0.3s ease 0.1s,
            opacity 0.3s ease;
    }
</style>
