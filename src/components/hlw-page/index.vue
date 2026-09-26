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

        <!-- 顶部插槽 -->
        <view v-if="$slots.top" class="hlw-page-top">
            <slot name="top"></slot>
        </view>

        <!-- 内容插槽 -->
        <scroll-view 
            class="hlw-page-content"
            scroll-y
            @scrolltolower="onScrollToLower"
        >
            <slot></slot>
            <view class="h-[20rpx]"></view>
            <view v-if="!$slots.bottom && hasSafeArea" class="safe-area-bottom"></view>
        </scroll-view>

        <!-- 底部插槽 -->
        <view v-if="$slots.bottom" class="hlw-page-bottom">
            <slot name="bottom"></slot>
            <view v-if="hasSafeArea" class="safe-area-bottom"></view>
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

import { useTheme } from "../../composables/theme";
import { computed } from "vue";
import { FONT_SIZE_VARIABLES } from "./config";

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
        default: "32rpx",
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
    },
    safeArea: {
        type: Boolean,
        default: undefined,
    },
});

const emit = defineEmits(["scrolltolower"]);

const title = computed(() => props.title);

const hasSafeArea = computed(() => {
    if (props.safeArea !== undefined) return props.safeArea;
    return props.isBack;
});

const navbarHeight = computed(() => {
    if (!props.isNav) return 0;
    const statusBarHeight = uni.getWindowInfo().statusBarHeight || 0;
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
    const headerHeight = menuButtonInfo.bottom - statusBarHeight + 6;
    return statusBarHeight + headerHeight;
});

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

<style lang="scss" src="./page.scss"></style>
