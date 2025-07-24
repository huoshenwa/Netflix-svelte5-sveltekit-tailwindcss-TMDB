<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { browser } from "$app/environment"; // SvelteKit 提供的浏览器检测

    // Svelte 5 中使用 $props() 接收参数
    let {
        videoId = "TMDR2_4223Y",
        isMuted = true,
        showControls = false,
        // Svelte 5 新语法：直接接收事件回调函数作为 props
        onmute = () => {},
        onunmute = () => {},
    }: {
        videoId: string;
        isMuted?: boolean;
        showControls?: boolean;
        // 定义事件回调函数的类型
        onmute?: () => void;
        onunmute?: () => void;
    } = $props();

    // 使用 any 类型避免在 SSR 时的类型问题
    let player: any;
    let playerElement: any;
    let isPlayerReady = false; // 添加播放器状态标记

    // 导出切换静音功能的函数，供外部组件调用
    export const toggleMute = () => {
        // 确保在浏览器环境且播放器已准备好
        if (browser && player && isPlayerReady) {
            // 如果当前是静音状态
            if (player.muted) {
                // 取消静音
                player.muted = false;
                // 更新本地状态变量
                isMuted = false;
                // Svelte 5 方式：直接调用回调函数
                onunmute?.();
            } else {
                // 如果当前不是静音状态，则设置为静音
                player.muted = true;
                // 更新本地状态变量
                isMuted = true;
                // Svelte 5 方式：直接调用回调函数
                onmute?.();
            }
        }
    };

    // 组件挂载时执行的生命周期函数
    onMount(async () => {
        // 双重检查确保在浏览器环境中运行
        if (browser && typeof window !== "undefined") {
            try {
                // 动态导入 Plyr 和 CSS，避免 SSR 问题
                const [{ default: Plyr }] = await Promise.all([
                    import("plyr"),
                    import("plyr/dist/plyr.css"), // 动态导入 CSS
                ]);

                // 确保 DOM 元素已经准备好
                if (playerElement) {
                    // 创建新的 Plyr 播放器实例
                    player = new Plyr(playerElement, {
                        // === 基础配置选项 ===

                        // autopause: 当多个视频同时存在时，是否自动暂停其他正在播放的视频
                        // false = 不自动暂停其他视频，允许多个视频同时播放
                        autopause: false,

                        // disableContextMenu: 是否禁用右键菜单
                        // true = 禁用右键菜单，用户无法通过右键访问浏览器默认菜单
                        disableContextMenu: true,

                        // muted: 初始化时是否静音
                        // 使用传入的 isMuted 参数值
                        muted: isMuted,

                        // controls: 播放器控制条配置
                        // 如果 showControls 为 true，显示完整控制条；否则隐藏所有控制条
                        controls: showControls
                            ? [
                                  "play-large", // 视频中央的大播放按钮
                                  "restart", // 重新开始播放按钮
                                  "rewind", // 快退按钮（默认快退10秒）
                                  "play", // 播放/暂停按钮
                                  "fast-forward", // 快进按钮（默认快进10秒）
                                  "progress", // 进度条和拖拽控制器，显示播放进度和缓冲进度
                                  "current-time", // 当前播放时间显示
                                  "duration", // 视频总时长显示
                                  "mute", // 静音/取消静音按钮
                                  "volume", // 音量控制滑块
                                  "captions", // 字幕开关按钮
                                  "settings", // 设置菜单按钮（画质、播放速度等）
                                  "pip", // 画中画模式按钮（目前仅Safari支持）
                                  "airplay", // AirPlay按钮（目前仅Safari支持）
                                  "download", // 下载按钮，提供下载链接
                                  "fullscreen", // 全屏模式切换按钮
                              ]
                            : [], // 如果不显示控制条，传入空数组

                        // === YouTube 特定配置 ===
                        youtube: {
                            // modestBranding: YouTube播放器品牌化程度
                            // 1 = 最小化YouTube品牌显示，隐藏YouTube logo
                            modestBranding: 1,

                            // rel: 视频结束后是否显示相关视频推荐
                            // 0 = 不显示相关视频推荐
                            rel: 0,

                            // iv_load_policy: 视频注释显示策略
                            // 3 = 不显示视频注释（那些悬浮在视频上的文字框）
                            iv_load_policy: 3,
                        },
                    });

                    // === 事件监听器设置 ===

                    // 监听播放器准备就绪事件
                    player.on("ready", () => {
                        console.log("Player is ready"); // 播放器准备完毕
                        isPlayerReady = true; // 标记播放器已准备好

                        // 延迟500毫秒后自动开始播放
                        // 延迟是为了确保播放器完全初始化完成
                        setTimeout(() => {
                            if (player && player.play) {
                                player.play(); // 开始播放视频
                                console.log("playing"); // 输出正在播放的日志
                            }
                        }, 500);
                    });

                    // 使用类型断言绕过 TypeScript 检查
                    // 监听静音事件 - 当用户通过播放器控制条点击静音按钮时触发
                    (player as any).on("mute", () => {
                        isMuted = true; // 更新本地状态
                        onmute?.(); // Svelte 5 方式：调用回调函数
                    });

                    // 监听取消静音事件 - 当用户通过播放器控制条取消静音时触发
                    (player as any).on("unmute", () => {
                        isMuted = false; // 更新本地状态
                        onunmute?.(); // Svelte 5 方式：调用回调函数
                    });
                }
            } catch (error) {
                console.error("Error loading Plyr:", error);
            }
        }
    });

    // 组件销毁时执行的生命周期函数
    onDestroy(() => {
        // 确保在浏览器环境中且播放器实例存在
        if (browser && player) {
            console.log("destroy"); // 输出销毁日志
            try {
                // 销毁播放器实例，释放内存和清理事件监听器
                // 这很重要，可以防止内存泄漏
                player.destroy();
            } catch (error) {
                console.error("Error destroying player:", error);
            }
        }
    });
</script>

<div
    class={`${showControls ? "h-[100vh] flex justify-center items-center" : "h-full"} relative bg-black overflow-hidden shadow-lg`}
>
    <div
        class={`flex justify-center aspect-video ${showControls ? "h-[100vh] w-[90%]" : "scale-[1.4]"}`}
    >
        <div
            bind:this={playerElement}
            data-plyr-provider="youtube"
            data-plyr-embed-id={videoId}
        ></div>
    </div>
</div>

<style>
    /* src/lib/PlyrCustom.css */

    /* Custom Plyr variables to style the player */
    :root {
        --plyr-color-main: #ff000078;
        --plyr-video-background: rgba(0, 0, 0, 1);
        --plyr-focus-visible-color: #00b3ff;
        --plyr-badge-background: #4a5464;
        --plyr-badge-text-color: #ffffff;
        --plyr-captions-background: rgba(0, 0, 0, 0.8);
        --plyr-captions-text-color: #ffffff;
        --plyr-control-icon-size: 24px;
        --plyr-control-spacing: 12px;
        --plyr-control-radius: 6px;
        --plyr-control-toggle-checked-background: #ff0000;
        --plyr-video-controls-background: linear-gradient(
            rgba(0, 0, 0, 0),
            rgba(0, 0, 0, 0.85)
        );
        --plyr-video-control-color: #6d6d6d;
        --plyr-video-control-color-hover: #ff0000;
        --plyr-video-control-background-hover: #ffffff;
        --plyr-menu-background: rgba(255, 255, 255, 0.9);
        --plyr-menu-color: #000000;
        --plyr-tooltip-background: rgba(255, 255, 255, 0.9);
        --plyr-tooltip-color: #000000;
        --plyr-font-family: "Arial", sans-serif;
        --plyr-font-size-base: 16px;
        --plyr-font-weight-bold: 600;
    }

    .plyr--video {
        height: 20px !important;
    }
    /* Optional: Customize loading spinner */
    .plyr__spinner {
        border-top-color: var(--plyr-color-main);
    }

    /* Optional: Customize progress bar */
    .plyr__progress__filled {
        background-color: var(--plyr-color-main);
    }

    /* Optional: Customize menu items */
    .plyr__menu__container {
        background-color: var(--plyr-menu-background);
    }
    .plyr__menu__item {
        color: var(--plyr-menu-color);
    }

    /* Custom Mute Button Styles */
    .mute-button {
        /* Adjust the size and positioning as needed */
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s ease;
        cursor: pointer;
    }

    .mute-button:hover {
        background-color: rgba(0, 0, 0, 0.7);
    }

    /* Optional: Add cursor pointer */
    .mute-button {
        cursor: pointer;
    }
</style>
