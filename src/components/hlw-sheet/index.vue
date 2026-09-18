<template>
    <view v-if="visible" class="hlw-sheet-root" :class="{ show: shown }">
        <view class="hlw-sheet-overlay" @tap="handleMaskTap" />
        <view class="hlw-sheet-panel" :style="{ maxHeight }" @tap.stop>
            <view class="hlw-sheet-header">
                <view v-if="showHandle" class="hlw-sheet-handle" />
                <text v-if="title" class="hlw-sheet-title">{{ title }}</text>
                <view v-if="showClose" class="hlw-sheet-close" @tap="handleClose">
                    <span class="i-fa6-solid-xmark" />
                </view>
            </view>

            <scroll-view
                class="hlw-sheet-body"
                scroll-y
                :enhanced="true"
                :enable-flex="true"
                :show-scrollbar="showScrollbar"
            >
                <view class="hlw-sheet-body-inner">
                    <slot />
                    <view v-if="showCta" class="hlw-sheet-cta" @tap="handleCta">
                        <text class="hlw-sheet-cta-text">{{ ctaText }}</text>
                    </view>
                    <slot name="footer" />
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script setup lang="ts">
/**
 * HlwSheet — 通用底部弹窗（Bottom Sheet）
 *
 * 单根模板 + position:fixed 覆盖视口，内部 overlay 与 panel 使用 absolute 定位。
 * 自管入场/出场动画时序（16ms 入场，300ms 出场），父组件只需 v-model 控制显隐。
 *
 * @props
 *   modelValue   - 是否显示（v-model）
 *   title        - 标题文字
 *   showHandle   - 是否显示顶部拖拽条，默认 true
 *   showClose    - 是否显示关闭按钮，默认 true
 *   closeOnMask  - 点击遮罩是否关闭，默认 true
 *   showCta      - 是否显示底部主按钮，默认 false
 *   ctaText      - 底部按钮文字，默认 "确定"
 *   maxHeight    - 最大高度，默认 "85vh"
 *
 * @events
 *   update:modelValue - v-model 更新
 *   close             - 关闭触发
 *   cta               - 点击底部按钮
 *
 * @slots
 *   default - 主内容（自动在 scroll-view 中滚动）
 *   footer  - 自定义底部区（紧跟 CTA 按钮之后）
 *
 * @example
 * ```vue
 * <hlw-sheet v-model="visible" title="标题" show-cta cta-text="确定" @cta="handleOk">
 *   <view>内容区</view>
 * </hlw-sheet>
 * ```
 */
import { ref, watch, onBeforeUnmount } from "vue";

interface Props {
    modelValue: boolean;
    title?: string;
    showHandle?: boolean;
    showClose?: boolean;
    closeOnMask?: boolean;
    showCta?: boolean;
    ctaText?: string;
    maxHeight?: string;
    /** 是否显示滚动条（仅在 enhanced=true 时生效），默认 true */
    showScrollbar?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    title: "",
    showHandle: true,
    showClose: true,
    closeOnMask: true,
    showCta: false,
    ctaText: "确定",
    maxHeight: "85vh",
    showScrollbar: true,
});

const emit = defineEmits<{
    (event: "update:modelValue", value: boolean): void;
    (event: "close"): void;
    (event: "cta"): void;
}>();

const visible = ref(false);
const shown = ref(false);

let closeTimer: ReturnType<typeof setTimeout> | null = null;
let openTimer: ReturnType<typeof setTimeout> | null = null;

const clearTimers = () => {
    if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
    }
    if (openTimer) {
        clearTimeout(openTimer);
        openTimer = null;
    }
};

watch(
    () => props.modelValue,
    (value) => {
        clearTimers();
        if (value) {
            visible.value = true;
            openTimer = setTimeout(() => {
                shown.value = true;
            }, 16);
        } else if (visible.value) {
            shown.value = false;
            closeTimer = setTimeout(() => {
                visible.value = false;
            }, 300);
        }
    },
    { immediate: true }
);

const handleClose = () => {
    emit("update:modelValue", false);
    emit("close");
};

const handleMaskTap = () => {
    if (props.closeOnMask) handleClose();
};

const handleCta = () => {
    emit("cta");
    emit("update:modelValue", false);
};

onBeforeUnmount(() => {
    clearTimers();
});
</script>

<style lang="scss" scoped>
.hlw-sheet-root {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
}

.hlw-sheet-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.55);
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hlw-sheet-root.show .hlw-sheet-overlay {
    opacity: 1;
}

.hlw-sheet-panel {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--surface-card, #ffffff);
    border-radius: var(--radius-xl, 32rpx) var(--radius-xl, 32rpx) 0 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 -12rpx 48rpx rgba(15, 23, 42, 0.15);
}

.hlw-sheet-root.show .hlw-sheet-panel {
    transform: translateY(0);
}

.hlw-sheet-header {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 0 24rpx;
}

.hlw-sheet-handle {
    width: 72rpx;
    height: 8rpx;
    border-radius: 999rpx;
    background: var(--border-color, #e2e8f0);
    margin-bottom: 20rpx;
}

.hlw-sheet-title {
    font-size: var(--font-md, 34rpx);
    font-weight: 700;
    color: var(--text-primary, #0f172a);
}

.hlw-sheet-close {
    position: absolute;
    right: 24rpx;
    top: 24rpx;
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background: var(--border-color-light, #f1f5f9);
    color: var(--text-muted, #64748b);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-sm, 26rpx);
    transition: background 0.2s ease;

    &:active {
        background: var(--border-color, #e2e8f0);
    }
}

.hlw-sheet-body {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
}

.hlw-sheet-body-inner {
    padding: 16rpx 36rpx 48rpx;
    display: flex;
    flex-direction: column;
    gap: 32rpx;
}

.hlw-sheet-cta {
    padding: 28rpx;
    background: #0f172a;
    border-radius: var(--radius-md, 16rpx);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.2);
    transition: transform 0.15s ease;

    &:active {
        transform: scale(0.98);
    }
}

.hlw-sheet-cta-text {
    font-size: var(--font-sm, 26rpx);
    font-weight: 400;
    color: #ffffff;
    letter-spacing: 0.5rpx;
}
</style>
