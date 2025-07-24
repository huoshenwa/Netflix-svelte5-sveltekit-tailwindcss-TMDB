<script lang="ts">
    import { cardState } from "$lib/store/GlobalState";
    import { handleNoImageError } from "$lib/utils/helpers";
    import { get } from "svelte/store";
    let { item }: { item: Movie } = $props();
    // 使用 $derived rune 替代 $: 响应式语句
    let currentState = $derived($cardState);
    const handleHover = (e: MouseEvent) => {
        e.stopPropagation();
        if (currentState.isHovered && currentState.cardId === item.id) {
            return;
        }
        
        const cardElement = e.currentTarget as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        cardState.update((state) => ({
            ...state,
            item,
            isHovered: true,
            cardId: item.id,
            position: {
                x: cardRect.left + cardRect.width / 2,
                y: cardRect.top,
            },
        }));

    };

    const handleUnhover = () => {
        if (currentState.cardId === item.id) {
            cardState.update((state) => ({
                ...state,
                isHovered: false,
                cardId: null,
                dimensions: { width: 0, height: 0 },
                item:null // 关键重置，因为cardId和item的混用又不重置item,导致了混乱
            }));
            
        }
    };
</script>

{#if item.backdrop_path}
    <div
        onmouseleave={handleUnhover}
        onmouseenter={handleHover}
        role="presentation"
        class="card pointer-events-auto relative sm:w-56 w-36"
    >
        <img
            onerror={handleNoImageError}
            src={`https://image.tmdb.org/t/p/w300${item.backdrop_path}`}
            alt={item.title}
        />
    </div>
{/if}

<style>
    .card {
        cursor: pointer;
        color: white;
        opacity: 1;
        position: relative;
    }

    .card img {
        width: 100%;
        display: block;
    }
</style>
