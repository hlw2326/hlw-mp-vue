<template>
    <view v-if="show" class="hlw-add-mini" :style="{ top }">
        <view class="hlw-add-mini__arrow" :style="arrowStyle" />
        <view class="hlw-add-mini__content">
            <view class="hlw-add-mini__text">
                <view class="hlw-add-mini__title">{{ title }}</view>
                <view v-if="desc" class="hlw-add-mini__desc">{{ desc }}</view>
            </view>
            <view class="hlw-add-mini__close" @tap="close">×</view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getDevice } from "../../request";

defineOptions({ name: "HlwAddMini" });

interface Props {
    /** 显示气泡否 */
    show?: boolean;
    /** 气泡主标题 */
    title?: string;
    /** 气泡副描述 */
    desc?: string;
}

withDefaults(defineProps<Props>(), {
    show: false,
    title: "添加到我的小程序",
    desc: "点击右上角 ··· 添加",
});

const emit = defineEmits<{
    (event: "close"): void;
}>();

const info = getDevice();

// 气泡顶部距
const top = computed(() => {
    const menu = uni.getMenuButtonBoundingClientRect();
    return `${menu.bottom + 10}px`;
});

// 箭头定位式
const arrowStyle = computed(() => {
    const menu = uni.getMenuButtonBoundingClientRect();
    const dotsCenterX = menu.left + menu.width * 0.28;
    const arrowRightPx = info.windowWidth - dotsCenterX;
    const bubbleRightPx = uni.upx2px(22);
    const arrowHalfWidthPx = uni.upx2px(12);
    const rightOffset = arrowRightPx - bubbleRightPx - arrowHalfWidthPx;

    return {
        right: `${rightOffset}px`,
    };
});

function close(): void {
    emit("close");
}
</script>

<style lang="scss" scoped>
.hlw-add-mini {
    --add-mini-bg: rgba(0, 0, 0, 0.72);
    position: fixed;
    right: 22rpx;
    z-index: 999;
    width: 340rpx;
    animation: hlw-add-mini-in 0.22s ease-out both;
}

.hlw-add-mini__arrow {
    position: absolute;
    right: 92rpx;
    top: -13rpx;
    width: 0;
    height: 0;
    z-index: 99999;
    border-left: 12rpx solid transparent;
    border-right: 12rpx solid transparent;
    border-bottom: 14rpx solid var(--add-mini-bg);
}

.hlw-add-mini__content {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 16rpx 14rpx 16rpx 20rpx;
    border-radius: 14rpx;
    background: var(--add-mini-bg);
    backdrop-filter: blur(12rpx);
    -webkit-backdrop-filter: blur(12rpx);
    box-shadow: 0 12rpx 34rpx rgba(15, 23, 42, 0.15);
}

.hlw-add-mini__text {
    flex: 1;
    min-width: 0;
}

.hlw-add-mini__title {
    color: #ffffff;
    font-size: 25rpx;
    font-weight: 400;
    line-height: 1.3;
    letter-spacing: 1rpx;
}

.hlw-add-mini__desc {
    margin-top: 6rpx;
    color: rgba(255, 255, 255, 0.72);
    font-size: 21rpx;
    line-height: 1.3;
    letter-spacing: 2rpx;
}

.hlw-add-mini__close {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 36rpx;
    height: 36rpx;
    color: rgba(255, 255, 255, 0.72);
    font-size: 30rpx;
    line-height: 1;
}

@keyframes hlw-add-mini-in {
    0% {
        opacity: 0;
        transform: translateY(-8rpx);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
