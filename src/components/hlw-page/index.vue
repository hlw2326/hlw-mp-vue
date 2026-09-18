<template>
    <view class="hlw-page-container" :class="[fontSizeClass, fontFamilyClass]" :style="pageStyle">
        <hlw-nav-bar v-if="isNav" 
                     :is-back="isBack" 
                     :title="title" 
                     :is-bar="isBar"
                     :title-align="titleAlign"
                     :title-size="titleSize"
                     :title-style="titleStyle"
                     :title-weight="titleWeight"
                     :border="border">
        </hlw-nav-bar>

        <!-- 上插槽 -->
        <view class="hlw-page-top">
            <slot name="top"></slot>
        </view>

        <!-- 内容插槽 scroll-view -->
        <scroll-view 
            class="hlw-page-content"
            scroll-y
            @scrolltolower="onScrollToLower"
        >
            <slot></slot>
            <view class="h-[60rpx]"></view>
            <view class="safe-area-bottom"></view>
        </scroll-view>

        <!-- 下插槽 -->
        <view class="hlw-page-bottom">
            <slot name="bottom"></slot>
            <view class="safe-area-bottom"></view>
        </view>
    </view>
</template>

<script lang="ts" setup>
/**
 * HlwPage — 页面核心容器组件
 *
 * 所有小程序页面的主框架容器。自动适配全局主题、字体大小和字体样式。
 * 可以快捷集成自定义导航栏（HlwNavBar），保持整个页面结构的一致性。
 *
 * @props
 *   isNav       - 是否显示自定义导航栏，默认 false
 *   isBar       - 是否占用状态栏高度，默认 true
 *   title       - 自定义导航栏标题文字
 *   isBack      - 是否显示自定义导航栏的返回键，默认 false
 *   titleAlign  - 标题对齐方式，'left' | 'center'
 *   titleSize   - 标题字体大小
 *   titleStyle  - 标题字体样式
 *   titleWeight - 标题字重
 *   border      - 是否显示自定义导航栏的下边框（下划线），默认 true

 *
 * @example
 * ```vue
 * <hlw-page is-nav is-back title="个人中心">
 *     <template #top>
 *         <view>固定在顶部的内容...</view>
 *     </template>
 *     <view>滚动的内容...</view>
 *     <template #bottom>
 *         <view>固定在底部的内容...</view>
 *     </template>
 * </hlw-page>
 * ```
 */
defineOptions({
    name: "HlwPage",
    options: {
        styleIsolation: "shared",
    },
});

import { useTheme } from "@hlw-mp/vue";
import { ref, computed } from "vue";

const { fontSize, fontSizeClass, fontFamilyClass } = useTheme();

const props = defineProps({
    isNav: {
        type: Boolean,
        default: false,
    },
    isBar: {
        type: Boolean,
        default: true,
    },
    title: {
        type: String,
        default: "",
    },
    isBack: {
        type: Boolean,
        default: false,
    },
    titleAlign: {
        type: String,
        default: "center",
    },
    titleSize: {
        type: String,
        default: "",
    },
    titleStyle: {
        type: String,
        default: "",
    },
    titleWeight: {
        type: String,
        default: "500",
    },
    border: {
        type: Boolean,
        default: true,
    }
});

const emit = defineEmits(["scrolltolower"]);

const title = computed(() => props.title);

const navbarHeight = computed(() => {
    if (!props.isNav) return 0;
    const statusBarHeight = uni.getSystemInfoSync()?.statusBarHeight || 0;
    let headerHeight = 44;
    try {
        const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
        if (menuButtonInfo && typeof menuButtonInfo.bottom === "number" && menuButtonInfo.bottom > 0) {
            headerHeight = menuButtonInfo.bottom - statusBarHeight + 6;
        }
    } catch (e) {
        console.warn(e);
    }
    return statusBarHeight + headerHeight;
});

const FONT_SIZE_VARIABLES: Record<string, Record<string, string>> = {
    small: {
        "--font-xs": "20rpx",
        "--font-sm": "22rpx",
        "--font-base": "24rpx",
        "--font-md": "26rpx",
        "--font-lg": "28rpx",
        "--font-xl": "30rpx",
    },
    standard: {
        "--font-xs": "22rpx",
        "--font-sm": "24rpx",
        "--font-base": "26rpx",
        "--font-md": "28rpx",
        "--font-lg": "30rpx",
        "--font-xl": "32rpx",
    },
    large: {
        "--font-xs": "24rpx",
        "--font-sm": "26rpx",
        "--font-base": "30rpx",
        "--font-md": "32rpx",
        "--font-lg": "34rpx",
        "--font-xl": "36rpx",
    },
    "extra-large": {
        "--font-xs": "26rpx",
        "--font-sm": "28rpx",
        "--font-base": "34rpx",
        "--font-md": "36rpx",
        "--font-lg": "38rpx",
        "--font-xl": "40rpx",
    },
};

const pageStyle = computed(() => {
    const currentVars = FONT_SIZE_VARIABLES[fontSize.value] || FONT_SIZE_VARIABLES.standard;
    return {
        "--navbar-height": `${navbarHeight.value}px`,
        ...currentVars,
    };
});



function onScrollToLower() {
    emit("scrolltolower");
}
</script>

<style lang="scss">
.hlw-page-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    font-size: var(--font-base);
}

.hlw-page-top {
    flex-shrink: 0;
}

.hlw-page-content {
    flex: 1;
    height: 0;
    min-height: 0;
    width: 100%;
}

.hlw-page-bottom {
    flex-shrink: 0;
}

.safe-area-bottom {
    width: 100%;
    height: constant(safe-area-inset-bottom);
    height: env(safe-area-inset-bottom);
}

/* 全局系统字体大小缩放配置 */
.font-size-small {
    --font-xs: 20rpx;
    --font-sm: 22rpx;
    --font-base: 24rpx;
    --font-md: 26rpx;
    --font-lg: 28rpx;
    --font-xl: 30rpx;
}

.font-size-standard {
    --font-xs: 22rpx;
    --font-sm: 24rpx;
    --font-base: 26rpx;
    --font-md: 28rpx;
    --font-lg: 30rpx;
    --font-xl: 32rpx;
}

.font-size-large {
    --font-xs: 24rpx;
    --font-sm: 26rpx;
    --font-base: 30rpx;
    --font-md: 32rpx;
    --font-lg: 34rpx;
    --font-xl: 36rpx;
}

.font-size-extra-large {
    --font-xs: 26rpx;
    --font-sm: 28rpx;
    --font-base: 34rpx;
    --font-md: 36rpx;
    --font-lg: 38rpx;
    --font-xl: 40rpx;
}

/* 全局字体样式配置 */
.font-family-system {
    font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Helvetica,
        Arial,
        sans-serif;
    view,
    text,
    button,
    input,
    textarea {
        font-family: inherit;
    }
}

.font-family-sans {
    font-family: "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
    view,
    text,
    button,
    input,
    textarea {
        font-family: inherit;
    }
}

.font-family-serif {
    font-family: "Songti SC", "STSong", "SimSun", "Georgia", serif;
    view,
    text,
    button,
    input,
    textarea {
        font-family: inherit;
    }
}

.font-family-kaiti {
    font-family: "Kaiti SC", "STKaiti", "KaiTi", "SimKai", serif;
    view,
    text,
    button,
    input,
    textarea {
        font-family: inherit;
    }
}
</style>
