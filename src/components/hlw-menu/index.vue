<template>
    <view class="hlw-menu" :class="{ 'hlw-menu--no-border': !props.border }">
        <!-- 标题 -->
        <view v-if="props.title" class="hlw-menu-title">
            <text>{{ props.title }}</text>
        </view>
        <view v-if="props.title" class="hlw-menu-title-divider"></view>

        <!-- 列表模式 -->
        <template v-if="props.mode === 'list'">
            <template v-for="(item, index) in visibleItems" :key="index">
                <navigator v-if="item.url" :url="item.url" animation-type="none" class="hlw-menu-item" hover-class="hlw-menu-item--active">
                    <view class="hlw-menu-left">
                        <view class="hlw-menu-icon" :class="`hlw-menu-icon--${item.iconTheme || 'slate'}`">
                            <image v-if="isImageIcon(item.icon)" :src="item.icon" class="hlw-menu-icon-img" mode="aspectFit" />
                            <span v-else :class="item.icon"></span>
                        </view>
                        <text class="hlw-menu-label">{{ item.label }}</text>
                    </view>
                    <view class="hlw-menu-right">
                        <text v-if="item.value" class="hlw-menu-value">{{ item.value }}</text>
                        <text v-if="item.tag" class="hlw-menu-tag" :class="[`hlw-menu-tag--${item.tagTheme || 'rose'}`, item.tagPulse ? 'hlw-menu-tag-pulse' : '']">{{ item.tag }}</text>
                        <span class="i-fa6-solid-chevron-right hlw-menu-arrow"></span>
                    </view>
                </navigator>

                <button
                    v-else-if="item.openType"
                    class="hlw-menu-item hlw-menu-item-btn"
                    hover-class="hlw-menu-item--active"
                    :open-type="item.openType"
                    :session-from="item.sessionFrom"
                    :send-message-title="item.sendMessageTitle"
                    :send-message-path="item.sendMessagePath"
                    :send-message-img="item.sendMessageImg"
                    :show-message-card="item.showMessageCard"
                    @click="handleClick(item)"
                    @contact="handleContact(item, $event)"
                    @getphonenumber="handleGetPhoneNumber(item, $event)"
                >
                    <view class="hlw-menu-left">
                        <view class="hlw-menu-icon" :class="`hlw-menu-icon--${item.iconTheme || 'slate'}`">
                            <image v-if="isImageIcon(item.icon)" :src="item.icon" class="hlw-menu-icon-img" mode="aspectFit" />
                            <span v-else :class="item.icon"></span>
                        </view>
                        <text class="hlw-menu-label">{{ item.label }}</text>
                    </view>
                    <view class="hlw-menu-right">
                        <span v-if="item.loading" class="i-fa6-solid-circle-notch hlw-menu-spin hlw-menu-muted"></span>
                        <text v-if="item.value" class="hlw-menu-value">{{ item.value }}</text>
                        <text v-if="item.tag" class="hlw-menu-tag" :class="[`hlw-menu-tag--${item.tagTheme || 'rose'}`, item.tagPulse ? 'hlw-menu-tag-pulse' : '']">{{ item.tag }}</text>
                        <span class="i-fa6-solid-chevron-right hlw-menu-arrow"></span>
                    </view>
                </button>

                <view v-else class="hlw-menu-item" hover-class="hlw-menu-item--active" @click="handleClick(item)">
                    <view class="hlw-menu-left">
                        <view class="hlw-menu-icon" :class="`hlw-menu-icon--${item.iconTheme || 'slate'}`">
                            <image v-if="isImageIcon(item.icon)" :src="item.icon" class="hlw-menu-icon-img" mode="aspectFit" />
                            <span v-else :class="item.icon"></span>
                        </view>
                        <text class="hlw-menu-label">{{ item.label }}</text>
                    </view>
                    <view class="hlw-menu-right">
                        <span v-if="item.loading" class="i-fa6-solid-circle-notch hlw-menu-spin hlw-menu-muted"></span>
                        <text v-if="item.value" class="hlw-menu-value">{{ item.value }}</text>
                        <text v-if="item.tag" class="hlw-menu-tag" :class="[`hlw-menu-tag--${item.tagTheme || 'rose'}`, item.tagPulse ? 'hlw-menu-tag-pulse' : '']">{{ item.tag }}</text>
                        <span class="i-fa6-solid-chevron-right hlw-menu-arrow"></span>
                    </view>
                </view>

                <view v-if="index < visibleItems.length - 1" class="hlw-menu-divider"></view>
            </template>
        </template>

        <!-- 宫格模式 -->
        <view v-else class="hlw-menu-grid" :style="{ gridTemplateColumns: `repeat(${props.columns}, 1fr)` }">
            <template v-for="(item, index) in visibleItems" :key="index">
                <navigator v-if="item.url" :url="item.url" animation-type="none" class="hlw-menu-grid-item" hover-class="hlw-menu-grid-item--active">
                    <view class="hlw-menu-grid-icon-wrap">
                        <view class="hlw-menu-icon hlw-menu-icon--grid" :class="`hlw-menu-icon--${item.iconTheme || 'slate'}`">
                            <image v-if="isImageIcon(item.icon)" :src="item.icon" class="hlw-menu-icon-img" mode="aspectFit" />
                            <span v-else :class="item.icon"></span>
                        </view>
                        <text v-if="item.tag" class="hlw-menu-badge" :class="[`hlw-menu-tag--${item.tagTheme || 'rose'}`, item.tagPulse ? 'hlw-menu-tag-pulse' : '']">{{ item.tag }}</text>
                    </view>
                    <text class="hlw-menu-grid-label">{{ item.label }}</text>
                </navigator>

                <view v-else class="hlw-menu-grid-item" hover-class="hlw-menu-grid-item--active" @click="handleClick(item)">
                    <view class="hlw-menu-grid-icon-wrap">
                        <view class="hlw-menu-icon hlw-menu-icon--grid" :class="`hlw-menu-icon--${item.iconTheme || 'slate'}`">
                            <image v-if="isImageIcon(item.icon)" :src="item.icon" class="hlw-menu-icon-img" mode="aspectFit" />
                            <span v-else :class="item.icon"></span>
                        </view>
                        <text v-if="item.tag" class="hlw-menu-badge" :class="[`hlw-menu-tag--${item.tagTheme || 'rose'}`, item.tagPulse ? 'hlw-menu-tag-pulse' : '']">{{ item.tag }}</text>
                    </view>
                    <text class="hlw-menu-grid-label">{{ item.label }}</text>
                </view>
            </template>
        </view>
    </view>
</template>

<script setup lang="ts">
/**
 * HlwMenu 菜单组件
 *
 * 支持列表模式和宫格模式，数据驱动，适用于个人中心、设置页等场景。
 *
 * @example 列表模式
 * ```vue
 * <hlw-menu title="我的服务" :items="menuItems" @click="handleClick" />
 * ```
 *
 * @example 宫格模式
 * ```vue
 * <hlw-menu mode="grid" :columns="4" :items="gridItems" @click="handleClick" />
 * ```
 *
 * @example 无边框
 * ```vue
 * <hlw-menu :items="menuItems" :border="false" />
 * ```
 */

import { computed } from "vue";
import type { HlwMenuItem } from "./types";

interface Props {
    /**
     * 菜单项数据列表。
     * 每项可设置图标、文字、跳转路径、右侧标签、右侧纯文字、加载状态等。
     * 设置 `visible: false` 可隐藏某一项。
     */
    items: HlwMenuItem[];
    /**
     * 卡片标题，显示在菜单上方，标题下方带虚线分割。
     * 不传则不显示标题区域。
     * @default ""
     */
    title?: string;
    /**
     * 布局模式。
     * - `list`：列表模式，左侧图标 + 文字，右侧可显示标签 / 纯文字 / 加载状态 + 箭头
     * - `grid`：宫格模式，图标居中 + 文字在下方，支持右上角角标
     * @default "list"
     */
    mode?: "list" | "grid";
    /**
     * 宫格模式每行列数，仅 `mode="grid"` 时生效。
     * @default 4
     */
    columns?: number;
    /**
     * 是否显示卡片外边框。
     * @default true
     */
    border?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    title: "",
    mode: "list",
    columns: 4,
    border: true,
});

const emit = defineEmits<{
    /**
     * 点击无跳转路径的菜单项时触发。
     * 有 `url` 的项由 `navigator` 自行跳转，不触发此事件。
     * @param item 被点击的菜单项
     */
    click: [item: HlwMenuItem];
    /**
     * `openType="contact"` 的菜单项，打开客服会话时触发。
     */
    contact: [item: HlwMenuItem, event: unknown];
    /**
     * `openType="getPhoneNumber"` 的菜单项，获取手机号回调时触发。
     */
    getphonenumber: [item: HlwMenuItem, event: unknown];
}>();

const isImageIcon = (icon?: string) => {
    if (!icon) return false;
    return icon.startsWith("http") || icon.startsWith("/") || icon.startsWith(".") || icon.includes("/");
};

const visibleItems = computed(() => props.items.filter((item) => item.visible !== false));

const handleClick = (item: HlwMenuItem) => {
    emit("click", item);
};

const handleContact = (item: HlwMenuItem, event: unknown) => {
    emit("contact", item, event);
};

const handleGetPhoneNumber = (item: HlwMenuItem, event: unknown) => {
    emit("getphonenumber", item, event);
};
</script>

<style lang="scss" scoped>
.hlw-menu {
    --hlw-menu-icon-size: var(--font-md, 34rpx);
    --hlw-menu-icon-box-size: var(--hlw-menu-icon-size);
    --hlw-menu-grid-icon-size: var(--font-xl, 42rpx);
    --hlw-menu-grid-icon-box-size: calc(var(--hlw-menu-grid-icon-size) + 52rpx);
    background: var(--surface-card, #ffffff);
    border-radius: var(--radius-lg, 30rpx);
    border: 1rpx solid var(--border-color-light, #ececec);
    overflow: hidden;
    width: 100%;

    &--no-border {
        border: none;
    }
}

/* 标题 */
.hlw-menu-title {
    padding: 24rpx 32rpx;
    text {
        font-size: var(--font-sm, 26rpx);
        font-weight: 600;
        color: var(--text-subtle, #94a3b8);
        letter-spacing: 1rpx;
    }
}

.hlw-menu-title-divider {
    height: 0;
    border-bottom: 1rpx dashed var(--border-color-light, #ececec);
}

/* ========== 列表模式 ========== */
.hlw-menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx 36rpx;

    &--active {
        background: var(--surface-card-muted, #f8fafc);
    }
}

/* open-type button 模式：去除微信 button 原生样式，对齐 .hlw-menu-item 布局 */
.hlw-menu-item-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin: 0;
    padding: 32rpx 36rpx;
    background: transparent;
    color: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    border-radius: 0;
    border: none;
    text-align: left;
    box-sizing: border-box;

    &::after {
        border: none;
        display: none;
    }
}

.hlw-menu-divider {
    margin: 0 36rpx;
    height: 0;
    border-bottom: 1rpx dashed var(--border-color-light, #ececec);
}

.hlw-menu-left {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.hlw-menu-right {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

/* ========== 宫格模式 ========== */
.hlw-menu-grid {
    display: grid;
    padding: 6rpx 0 24rpx;
}

.hlw-menu-grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
    padding: 12rpx 8rpx;

    &--active {
        background: var(--surface-card-muted, #f8fafc);
    }
}

.hlw-menu-grid-icon-wrap {
    position: relative;
    padding-top: 20rpx; /* 预留徽标空间，保证所有格子图标水平对齐 */
}

.hlw-menu-badge {
    position: absolute;
    top: 0;
    right: -8rpx;
    font-size: var(--font-xs, 22rpx);
    color: #fff;
    padding: 0 8rpx;
    border-radius: 9999rpx;
    min-width: 28rpx;
    text-align: center;
    line-height: 28rpx;
    height: 28rpx;
}

.hlw-menu-grid-label {
    font-size: var(--font-sm, 26rpx);
    color: var(--text-secondary, #334155);
    text-align: center;
}

/* ========== 图标 ========== */
.hlw-menu-icon {
    width: var(--hlw-menu-icon-box-size);
    height: var(--hlw-menu-icon-box-size);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    text,
    span,
    .hlw-menu-icon-img {
        width: var(--hlw-menu-icon-size);
        height: var(--hlw-menu-icon-size);
        font-size: var(--hlw-menu-icon-size);
        display: inline-block;
    }

    &--grid {
        width: var(--hlw-menu-grid-icon-box-size);
        height: var(--hlw-menu-grid-icon-box-size);
        text,
        span,
        .hlw-menu-icon-img {
            width: var(--hlw-menu-grid-icon-size);
            height: var(--hlw-menu-grid-icon-size);
            font-size: var(--hlw-menu-grid-icon-size);
            display: inline-block;
        }
    }

    &--orange {
        color: #f97316;
    }
    &--purple {
        color: #a855f7;
    }
    &--wechat {
        color: #07c160;
    }
    &--cyan {
        color: #06b6d4;
    }
    &--emerald {
        color: #10b981;
    }
    &--slate {
        color: #64748b;
    }
    &--rose {
        color: #f43f5e;
    }
    &--blue {
        color: var(--primary-color, #3b82f6);
    }
    &--red {
        color: #ef4444;
    }
}

/* ========== 标签 / 角标 ========== */
.hlw-menu-label {
    font-size: var(--font-base);
    color: var(--text-secondary, #334155);
    letter-spacing: 1rpx;
}

.hlw-menu-value {
    font-size: var(--font-sm, 26rpx);
    color: var(--text-subtle, #94a3b8);
}

.hlw-menu-tag {
    font-size: var(--font-xs, 22rpx);
    color: #fff;
    padding: 2rpx 12rpx;
    border-radius: 9999rpx;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.hlw-menu-tag--orange {
    background: #fb923c;
}
.hlw-menu-tag--red {
    background: #ef4444;
}
.hlw-menu-tag--wechat {
    background: #07c160;
}
.hlw-menu-tag--rose {
    background: #f43f5e;
}
.hlw-menu-tag--blue {
    background: var(--primary-color, #3b82f6);
}

.hlw-menu-tag-pulse {
    animation: tag-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes tag-pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.hlw-menu-arrow {
    color: var(--text-disabled, #d1d5db);
    font-size: var(--font-sm, 26rpx);
}
.hlw-menu-spin {
    animation: icon-spin 1s linear infinite;
}
.hlw-menu-muted {
    color: var(--text-subtle, #94a3b8);
    font-size: var(--font-sm, 26rpx);
}

@keyframes icon-spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
