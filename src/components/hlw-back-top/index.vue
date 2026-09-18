<template>
    <view
        v-if="show"
        class="hlw-back-top"
        :style="positionStyle"
        hover-class="hlw-back-top--hover"
        @tap="onTap"
    >
        <slot>
            <span class="i-fa6-solid-chevron-up hlw-back-top__icon" />
        </slot>
    </view>
</template>

<script setup lang="ts">
/**
 * HlwBackTop — 回到顶部浮动按钮
 *
 * 嵌在 <hlw-page> 内时全自动：自动监听滚动，超过 threshold 显示，点击自动滚回顶部。
 *
 * @example 全自动（嵌在 hlw-page 内）
 * ```vue
 * <hlw-page>
 *   <view>...内容...</view>
 *   <hlw-back-top />
 * </hlw-page>
 * ```
 *
 * @example 手动控制（脱离 hlw-page 使用）
 * ```vue
 * <hlw-back-top :scroll-top="myScrollTop" @tap="myBackTopHandler" />
 * ```
 *
 * @example 自定义图标
 * ```vue
 * <hlw-back-top>
 *   <text class="i-fa6-solid-rocket" />
 * </hlw-back-top>
 * ```
 */
import { computed, inject, type Ref } from "vue";

interface PageScrollContext {
    scrollTop: Ref<number>;
    scrollToTop: () => void;
}

interface Props {
    /**
     * 当前滚动位置；嵌在 hlw-page 内时不用传（自动 inject）。
     * 脱离 hlw-page 使用时由父组件透传 scroll-view 的 scrollTop。
     */
    scrollTop?: number;
    /** 显示阈值（与 scrollTop 同单位），默认 200 */
    threshold?: number;
    /** 距底部，CSS 长度值，默认 120rpx（避开 tabBar / 安全区） */
    bottom?: string;
    /** 距右侧，CSS 长度值，默认 32rpx */
    right?: string;
    /** 强制显隐：传入 boolean 时覆盖自动判断 */
    visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    scrollTop: 0,
    threshold: 200,
    bottom: "120rpx",
    right: "32rpx",
    visible: undefined,
});

const emit = defineEmits<{
    (event: "tap"): void;
}>();

const pageCtx = inject<PageScrollContext | null>("hlwPageScroll", null);

const currentScrollTop = computed(() => {
    if (pageCtx) return pageCtx.scrollTop.value;
    return props.scrollTop;
});

const show = computed(() => {
    if (typeof props.visible === "boolean") return props.visible;
    return currentScrollTop.value > props.threshold;
});

const positionStyle = computed(() => ({
    bottom: props.bottom,
    right: props.right,
}));

function onTap() {
    if (pageCtx) pageCtx.scrollToTop();
    emit("tap");
}

defineOptions({
    name: "HlwBackTop",
});
</script>

<style lang="scss" scoped>
.hlw-back-top {
    position: fixed;
    z-index: 99;
    width: 66rpx;
    height: 66rpx;
    background: #ffffff;
    border: 1rpx solid var(--border-color, #e2e8f0);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary, #475569);
}

.hlw-back-top--hover {
    background: #f8fafc;
    transform: scale(0.95);
}

.hlw-back-top__icon {
    font-size: var(--font-base, 26rpx);
    color: inherit;
}
</style>
