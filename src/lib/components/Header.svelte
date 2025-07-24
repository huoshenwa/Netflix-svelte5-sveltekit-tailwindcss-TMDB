<script lang="ts">
    import { onMount } from "svelte";
    import logo from "../../public/images/Netflix-LOGO.png";
    import profileImage from "../../public/images/profile.jpg";
    import { Bell, ChevronRight, Menu, Search, X } from "lucide-svelte";
    import { goto } from "$app/navigation";
    // 页面整块样式吸顶
    let isSticky: boolean = $state(false);
    // 页面整块滚动事项
    const handleScroll = () => {
        isSticky = window.scrollY > 50;
    };
    onMount(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll); //清理逻辑，页面切换等情况会执行，避免内存泄漏
        };
    });
    // 搜索相关
    let searchInputRef;
    let isSearchActive: boolean = $state(false);
    let searchQuery: string = $state("");
    const toogleSearch = (e: Event) => {
        e.stopPropagation(); // 阻止事件向父组件传递
        isSearchActive = !isSearchActive;
    };
    const handleSearch = async (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            event.preventDefault();
            const query = searchQuery.trim();

            if (searchQuery === "") {
                return;
            }

            await goto(`/search?query=${encodeURIComponent(searchQuery)}`);

            isSearchActive = false;
            searchQuery = "";
        }
    };
    // 菜单逻辑事项
    let isMenuOpen: boolean = $state(false);
    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
    };
    const closeMenu = () => {
        isMenuOpen = false;
    };
</script>

<header
    class={`fixed top-0 left-0 right-0 z-50 flex flex-col px-5 md:px-10 
transition-all duration-300 text-white ease-in-out ${isSticky ? "bg-black shadow-lg" : "bg-gradient-to-b from-[rgba(0,0,0,0.7)] to-transparent"}
`}
>
    <div class="flex justify-between items-center">
        <!-- logo 和 导航栏分类栏目展示 --开始 -->
        <div class="flex gap-x-6 md:gap-x-8 items-center">
            <a href="/">
                <img src={logo} alt="NETFLIX LOGO" class="w-28" />
            </a>

            <nav class="hidden text-sm md:flex space-x-4">
                <a href="/" class="hover:text-gray-300">Home</a>
                <a href="/" class="hover:text-gray-300">TV Shows</a>
                <a href="/" class="hover:text-gray-300">Movies</a>
                <a href="/" class="hover:text-gray-300">New & Popular</a>
                <a href="/myList" class="hover:text-gray-300">My List</a>
                <a href="/" class="hover:text-gray-300">Browse By Languages</a>
            </nav>
        </div>
        <!-- logo 和 导航栏分类栏目展示 --结束 -->
        <!-- 右侧一堆功能图标 --开始 -->
        <div class="flex items-center space-x-4">
            <!-- 搜索输入框 -->
            <div
                role="presentation"
                id="search-bar"
                class={`hidden md:flex search-container ${isSearchActive ? "active" : ""}`}
                onclick={toogleSearch}
            >
                <button
                    class="search-button"
                    aria-label="Toggle Search"
                    onclick={toogleSearch}
                >
                    <Search size={20} color="white" />
                </button>
                <input
                    bind:this={searchInputRef}
                    bind:value={searchQuery}
                    placeholder="Search"
                    aria-label="Search"
                    type="text"
                    class="search-input"
                    onkeydown={handleSearch}
                />
            </div>
            <!-- 提醒铃铛 -->
            <Bell size={20} color="white" />
            <!-- 图片标识 -->
            <img
                src={profileImage}
                class="w-8 h-8 rounded cursor-pointer"
                alt="Profile"
            />
            <!-- 向右箭头 -->
            <ChevronRight size={20} color="white" />
            <!-- 菜单按钮 （小屏幕显示） -->
            <button
                id="ham-button"
                class="md:hidden ml-4 focus:outline-none"
                aria-label="ham-button"
                onclick={toggleMenu}
            >
                <Menu />
            </button>
        </div>
        <!-- 右侧一堆功能图标 --结束 -->
    </div>
    <!-- 小屏点击菜单打开后展示的搜索 -- 开始 -->
    <div
        id="mobile-menu"
        role="presentation"
        onclick={(e) => e.stopPropagation()}
        class={`mobile-menu relative ${isMenuOpen ? "open" : ""} lg:hidden`}
    >
        <!-- 关闭按钮 x -->
        <button onclick={closeMenu} class="absolute right-4">
            <X color="white" size={24} />
        </button>
        <!-- 搜索框 -->
        <div
            role="presentation"
            id="search-bar"
            class={`search-container ${isSearchActive ? "active" : ""}`}
            onclick={toogleSearch}
        >
            <button
                class="search-button"
                aria-label="Toggle Search"
                onclick={toogleSearch}
            >
                <Search size={20} color="white" />
            </button>
            <input
                bind:this={searchInputRef}
                bind:value={searchQuery}
                placeholder="Search"
                aria-label="Search"
                type="text"
                class="search-input"
                onkeydown={handleSearch}
            />
        </div>
        <!-- // 搜索框下面提供跳转链接 -->
        <a href="/" class="hover:text-gray-300">Home</a>
        <a href="/" class="hover:text-gray-300">TV Shows</a>
        <a href="/" class="hover:text-gray-300">Movies</a>
        <a href="/" class="hover:text-gray-300">New & Popular</a>
        <a href="/" class="hover:text-gray-300">My List</a>
        <a href="/" class="hover:text-gray-300">Browse By Languages</a>
    </div>
    <!-- 小屏点击菜单打开后展示的搜索 -- 结束 -->
    <!-- 点击空白处关闭 -->
    {#if isMenuOpen}
        <div role="presentation" class="overlay show" onclick={closeMenu}></div>
    {/if}
</header>

<style>
    .search-container {
        position: relative;

        align-items: center;
        transition:
            width 0.3s ease-in-out,
            background-color 0.3s ease-in-out;
        overflow: hidden;
        width: 40px;
    }

    .search-container.active {
        width: 200px;
        border: 1px solid white;
        background-color: black;
    }
    .search-input {
        padding-left: 2rem;
        flex: 1;
        padding-block: 0.5rem;
        background: transparent;
        border: none;
        outline: none;
        opacity: 0;
        color: white;
        transition: opacity 0.3s ease-in-out;
    }

    .search-container.active .search-input {
        opacity: 1;
    }

    .search-button {
        position: absolute;
        padding: 0.5rem;
        cursor: pointer;
        display: flex;
        justify-items: center;
        align-items: center;
    }

    .search-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .mobile-menu {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: #000;
        padding: 1rem 2rem;
        transition: transfrom 0.3s ease-in-out;
        transform: translateY(-100%);
        z-index: 60;
    }

    .mobile-menu.open {
        transform: translateY(0);
    }
    .mobile-menu a {
        display: block;
        padding: 0.5rem 0;
        color: white;
        text-decoration: none;
        font-size: 1.1rem;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0;
        visibility: hidden;
        transition:
            opacity 0.3s ease-in-out,
            visibility 0.3s ease-in-out;
        z-index: 55;
    }

    .overlay.show {
        opacity: 1;
        visibility: visible;
    }
</style>
