<script lang="ts">
    import { ChevronLeft, ChevronRight } from "lucide-svelte";
    import Card from "$lib/components/Card.svelte";
    let { title, items } = $props();

    const scrollAmount: number = 320; // 水平移动举例

    let carouselContainer: HTMLDivElement | null = $state(null);
    let scrollPosition: number = $state(0); //水平移动位置记录

    const scrollLeft = () => {
        if (carouselContainer) {
            scrollPosition = Math.max(0, scrollPosition - scrollAmount);
            carouselContainer.scrollTo({
                // 让元素滚动条水平移动
                left: scrollPosition,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        if (carouselContainer) {
            const maxScroll =
                //如果下面没有隐藏向右箭头则要如此来做：  carouselContainer.scrollWidth - carouselContainer.clientWidth;
                // scrollPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
                (scrollPosition += scrollAmount);
            carouselContainer.scrollTo({
                left: scrollPosition,
                behavior: "smooth",
            });
        }
    };
    const handleScroll = () => {
        // 用户点击滚动条滚动或者用鼠标滚轮滚动时触发
        if (carouselContainer) {
            scrollPosition = carouselContainer.scrollLeft; //scrollLeft：返回元素当前的水平滚动位置（以像素为单位）。
        }
    };
</script>

<div class="carousel-wrapper">
    <h1 class="mt-4 mb-2 text-white text-2xl font-semibold">{title}</h1>

    <div class="carousel-container-wrapper relative">
        {#if scrollPosition > 0}
            <button
                onclick={scrollLeft}
                class="carousel-button carousel-button-left"
            >
                <ChevronLeft />
            </button>
        {/if}
        <!-- 如果滚动条水平移动距离+滚动条可视宽度 > 滚动条总宽度 则不显示 -->
        {#if carouselContainer && scrollPosition + carouselContainer.clientWidth < carouselContainer.scrollWidth}
            <button
                onclick={scrollRight}
                class="carousel-button carousel-button-right"
            >
                <ChevronRight />
            </button>
        {/if}
        <div
            bind:this={carouselContainer}
            class="carousel-container"
            onscroll={handleScroll}
        >
            {#each items as item (item.id)}
                <div class="carousel-item">
                    <Card {item}/>
                   
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .carousel-wrapper {
        position: relative;
    }

    .carousel-container-wrapper {
        position: relative;
    }

    .carousel-container {
        overflow-x: auto;
        display: flex;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
    }

    .carousel-container::-webkit-scrollbar {
        display: none;
    }

    .carousel-item {
        scroll-snap-align: center;
        flex: 0 0 auto;
        margin-right: 1rem;
    }

    .carousel-button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        padding: 1rem;
        cursor: pointer;
        z-index: 10;
        transition: background-color 0.3s ease;
    }

    .carousel-button-left {
        left: 0;
        height: 100%;
    }

    .carousel-button-right {
        right: 0;
        height: 100%;
    }
</style>
