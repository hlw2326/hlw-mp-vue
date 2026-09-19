<template>
    <view 
        class="hlw-status-bar" 
        :class="[props.fixed ? 'fixed' : '', props.customClass]" 
        :style="statusBarStyle"
    >
        <slot></slot>
    </view>
    <!-- Spacer block when fixed is true to prevent layout shift -->
    <view v-if="props.fixed && props.placeholder" :style="{ height: statusBarHeight + 'px' }"></view>
</template>

<script lang="ts" setup>
/**
 * hlw-status-bar — 自适应系统状态栏背景组件
 *
 * 自动获取设备系统状态栏高度，并应用与 hlw-nav-bar 完全一致的全局配色主题。
 * 同时支持自定义 class 或自定义背景色/渐变色（自定义优先级最高）。
 *
 * @props
 *   fixed       - 是否固定在顶部，默认 false
 *   placeholder - 是否生成占位高度区块（仅在 fixed 为 true 时有效），默认 true
 *   zIndex      - 自定义 z-index 层级，默认 999
 *   customClass - 自定义样式类
 *   bgColor     - 自定义背景颜色或渐变色（最高优先级，覆盖主题）
 *
 * @example
 * ```vue
 * <hlw-status-bar fixed bg-color="#ff0000" />
 * ```
 */
import { computed } from "vue";


const props = defineProps({
    /** 是否固定在顶部 */
    fixed: {
        type: Boolean,
        default: false,
    },
    /** 是否生成占位高度区块（仅在 fixed 为 true 时有效，防止页面内容被遮挡） */
    placeholder: {
        type: Boolean,
        default: true,
    },
    /** 自定义 z-index（在 fixed 为 true 时生效） */
    zIndex: {
        type: Number,
        default: 999,
    },
    /** 自定义 CSS Class */
    customClass: {
        type: String,
        default: "",
    },
    /** 自定义背景颜色（支持 Hex/RGB/渐变色，优先级最高） */
    bgColor: {
        type: String,
        default: "",
    },
});

const statusBarHeight: number = uni.getSystemInfoSync().statusBarHeight || 20;

const statusBarStyle = computed(() => {
    const style: Record<string, any> = {
        height: statusBarHeight + "px",
    };
    if (props.fixed) {
        style.zIndex = props.zIndex;
    }
    if (props.bgColor) {
        // 自定义颜色优先级最高，直接设置 background 样式覆盖 class 的 background-color
        style.background = props.bgColor;
    }
    return style;
});
</script>

<style lang="scss" scoped>
.hlw-status-bar {
    width: 750rpx;
    background-color: var(--navbar-bg-color, #ffffff);
    transition: background-color 0.2s ease, background 0.2s ease;

    &.fixed {
        position: fixed;
        top: 0;
        left: 0;
    }
}
</style>
