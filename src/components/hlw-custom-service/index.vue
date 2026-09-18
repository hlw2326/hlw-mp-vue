<template>
    <view class="contact-card">
        <view class="contact-copy">
            <text class="contact-title">{{ title }}</text>
            <text class="contact-desc">{{ desc }}</text>
        </view>
        <button class="contact-button" open-type="contact" :send-message-title="resolvedContact.title" :send-message-path="resolvedContact.path" :send-message-img="resolvedContact.img" :show-message-card="resolvedContact.show">
            <span class="iconfont icon-service" />
            <text class="contact-button-text">{{ resolvedBtnTitle }}</text>
        </button>
    </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

/**
 * HlwCustomService — 客服卡片自定义组件
 *
 * 用于引导用户点击联系微信客服，支持配置标题、描述、按钮文案及原生客服卡片参数。
 *
 * @props
 *   title      - 客服卡片主标题
 *   desc       - 客服卡片描述/说明文字
 *   btnTitle  - 客服按钮文案，默认 "联系客服"
 *   contact    - 微信原生客服卡片配置项
 *
 * @example
 * ```vue
 * <HlwCustomService
 *     title="专属客服"
 *     desc="遇到问题？点击咨询您的专属客服"
 *     btnTitle="去咨询"
 *     :contact="{ send_message_title: '咨询标题' }"
 * />
 * ```
 */

defineOptions({ name: "HlwCustomService" });

interface ContactConfig {
    sendMessageTitle?: string;
    sendMessagePath?: string;
    sendMessageImg?: string;
    showMessageCard?: boolean;
}

const props = withDefaults(
    defineProps<{
        title: string;
        desc: string;
        btnTitle?: string;
        contact?: ContactConfig;
    }>(),
    {
        btnTitle: "",
        contact: () => ({}),
    },
);

const resolvedBtnTitle = computed(() => {
    return props.btnTitle || "联系客服";
});

const resolvedContact = computed(() => {
    const c = props.contact || {};
    return {
        title: c.sendMessageTitle ?? "",
        path: c.sendMessagePath ?? "",
        img: c.sendMessageImg ?? "",
        show: c.showMessageCard ?? false,
    };
});
</script>

<style scoped lang="scss">
.contact-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--card-padding);
    border: 1rpx solid var(--border-color-light);
    border-radius: var(--card-radius);
    background: linear-gradient(135deg, #ffffff 0%, var(--primary-light, rgba(76, 68, 239, 0.05)) 100%);
}

.contact-copy {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    margin-right: 22rpx;
}

.contact-title {
    margin-bottom: 8rpx;
    color: #1f2937;
    font-size: var(--font-base);
    line-height: 1.3;
    letter-spacing: 3rpx;
}

.contact-desc {
    color: #94a3b8;
    font-size: var(--font-sm);
    line-height: 1.45;
    letter-spacing: 3rpx;
}

.contact-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    width: 176rpx;
    height: 68rpx;
    flex-shrink: 0;
    margin: 0;
    border-radius: var(--radius-full);
    background: var(--primary-color, #3b82f6);
    color: #ffffff;
    font: inherit;
    line-height: 68rpx;
}

.contact-button-text {
    color: inherit;
    font-size: var(--font-sm);
    line-height: 1;
}
</style>
