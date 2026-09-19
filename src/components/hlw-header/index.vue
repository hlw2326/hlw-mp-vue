<template>
    <view class="hlw-header" :style="{ height: totalNavBarHeight + 'px' }">
        <view class="header-bg-layer" :class="hasBgSlot ? '' : props.bgClass">
            <slot v-if="!props.isBack" name="bg"></slot>
        </view>
        <view class="status-bar-spacer" :style="{ height: statusBarHeight + 'px' }"></view>
        <view class="header-content-area" :style="{ height: NAV_BAR_CONTENT_HEIGHT + 'px' }">
            <template v-if="props.isBack">
                <!-- 返回按钮 -->
                <view class="header-back" @click="handleBack">
                    <slot name="back-icon">
                        <span class="i-fa6-solid-chevron-left header-back-icon"></span>
                    </slot>
                </view>

                <!-- 标题 -->
                <view class="header-title" :class="props.titleAlign === 'left' ? 'header-title--left' : 'header-title--center'">
                    <slot name="title">
                        <text class="header-title-text" :style="titleStyle">{{ props.title }}</text>
                    </slot>
                </view>

                <!-- 右侧占位（居中时保持对称） -->
                <view v-if="props.titleAlign === 'center'" class="header-placeholder"></view>
            </template>

            <slot v-else>
                <view v-if="props.title" class="header-title header-title--center">
                    <text class="header-title-text" :style="titleStyle">{{ props.title }}</text>
                </view>
            </slot>
        </view>
    </view>
</template>

<script setup lang="ts">
/**
 * HlwHeader — 页面顶部导航栏
 *
 * 自动适配状态栏高度和胶囊按钮位置（微信小程序），支持返回按钮、自定义标题和背景。
 *
 * @props
 *   title       - 标题文字
 *   titleAlign  - 标题对齐：center / left，默认 center
 *   titleSize   - 标题字号，默认 var(--font-base)
 *   titleWeight - 标题字重，默认 500
 *   titleColor  - 标题颜色
 *   isBack      - 是否显示返回按钮，默认 false
 *   bgClass     - 自定义背景 CSS class
 *   extraHeight - 额外高度（rpx），默认 0
 *
 * @events
 *   back - 点击返回按钮
 *
 * @slots
 *   bg        - 自定义背景层
 *   title     - 自定义标题区域
 *   back-icon - 自定义返回图标
 *
 * @example
 * ```vue
 * <HlwHeader title="我的" is-back @back="goBack" />
 * ```
 */
import { ref, computed, useSlots } from "vue";

const getNavBarContentHeight = (): number => {
    const menuInfo = uni.getMenuButtonBoundingClientRect();
    const systemInfo = uni.getSystemInfoSync();
    return (menuInfo.top - systemInfo.statusBarHeight!) * 2 + menuInfo.height;
};

const getStatusBarHeight = (): number => {
    return uni.getSystemInfoSync().statusBarHeight || 20;
};


const NAV_BAR_CONTENT_HEIGHT = getNavBarContentHeight();

interface Props {
    extraHeight?: number;
    bgClass?: string;
    isBack?: boolean;
    title?: string;
    /** 标题对齐方式，默认 center */
    titleAlign?: "center" | "left";
    /** 标题字号，默认 26rpx */
    titleSize?: string;
    /** 标题字重，默认 500 */
    titleWeight?: string | number;
    /** 标题颜色 */
    titleColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
    extraHeight: 0,
    bgClass: "",
    isBack: false,
    title: "",
    titleAlign: "center",
    titleSize: "var(--font-base, 28rpx)",
    titleWeight: 500,
    titleColor: "",
});

const emit = defineEmits<{
    back: [];
}>();

const handleBack = () => {
    emit("back");

    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
        return;
    }

    const homeUrl = "/pages/index/index";
    uni.switchTab({
        url: homeUrl,
        fail: () => {
            uni.reLaunch({ url: homeUrl });
        },
    });
};

const titleStyle = computed(() => ({
    fontSize: props.titleSize,
    fontWeight: String(props.titleWeight),
    ...(props.titleColor ? { color: props.titleColor } : {}),
}));

const slots = useSlots();
const hasBgSlot = computed(() => !props.isBack && !!slots.bg);
const statusBarHeight = ref(getStatusBarHeight());
const totalNavBarHeight = computed(() => statusBarHeight.value + NAV_BAR_CONTENT_HEIGHT + props.extraHeight);
</script>

<style lang="scss" scoped>
.hlw-header {
    position: sticky;
    top: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.header-bg-layer {
    position: absolute;
    inset: 0;
    z-index: 0;
}

.status-bar-spacer {
    flex-shrink: 0;
    width: 100%;
    position: relative;
    z-index: 1;
}

.header-content-area {
    flex-shrink: 0;
    width: 100%;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
}

.header-back {
    width: 88rpx;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--text-secondary, #475569);

    &:active {
        opacity: 0.8;
    }
}

.header-back-icon {
    font-size: var(--font-base, 28rpx);
    color: inherit;
}

.header-title {
    flex: 1;
    overflow: hidden;

    &--center {
        text-align: center;
    }

    &--left {
        text-align: left;
        padding-left: 4rpx;
    }
}

.header-title-text {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 1rpx;
    font-size: var(--font-base, 28rpx);
    font-weight: 500;
    color: var(--text-primary, #14181f);
}

.header-placeholder {
    width: 88rpx;
    flex-shrink: 0;
}
</style>
