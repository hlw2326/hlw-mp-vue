<template>
    <!-- 激励视频模式：作为点击触发器包裹插槽内容 -->
    <view
        v-if="type === 'reward' && visible"
        :class="['hlw-ad', 'hlw-ad--reward', customClass]"
        :style="customStyle"
        @tap="open"
    >
        <slot />
    </view>

    <!-- 展示型广告模式：Banner / Grid / Custom -->
    <view
        v-else-if="visible"
        :class="['hlw-ad', `hlw-ad--${type}`, type === 'grid' ? `hlw-ad--${placement}` : '', customClass]"
        :style="style"
    >
        <ad
            v-if="type === 'banner'"
            type="banner"
            :unit-id="resolvedUnitId"
            @load="onLoad"
            @error="onError"
        />
        <ad-custom
            v-else
            :unit-id="resolvedUnitId"
            @load="onLoad"
            @error="onError"
        />
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { getAdUnitId, playRewardAd } from "../../utils/ad";
import type { HlwAdType, HlwGridPlacement, HlwRewardAdResult } from "./types";

defineOptions({ name: "HlwAd" });

interface Props {
    /** 广告类型值，默认 custom */
    type?: HlwAdType;
    /** 广告单元号 */
    unitId?: string;
    /** 格子定位值，默认 center */
    placement?: HlwGridPlacement;
    /** 自定义样式 */
    customStyle?: string;
    /** 自定义类名 */
    customClass?: string;
    /** 圆角大小值，默认 10rpx */
    radius?: string;
    /** 退出重试否，默认 true */
    retryConfirm?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    type: "custom",
    unitId: "",
    placement: "center",
    customStyle: "",
    customClass: "",
    radius: "10rpx",
    retryConfirm: true,
});

const emit = defineEmits<{
    (event: "load", payload: any): void;
    (event: "error", payload: any): void;
    (event: "close", result: HlwRewardAdResult): void;
}>();

const isClicked = ref(false);

const resolvedUnitId = computed(() => {
    if (props.unitId) return props.unitId;
    return getAdUnitId(props.type);
});

const visible = computed(() => !!resolvedUnitId.value);

const style = computed(() => {
    const styles: string[] = [];
    if (props.type !== "grid" && props.radius) {
        styles.push(`border-radius: ${props.radius}`);
    }
    if (props.customStyle) {
        styles.push(props.customStyle);
    }
    return styles.join(";");
});

function onLoad(event: any): void {
    emit("load", event);
}

function onError(event: any): void {
    console.warn(`[HlwAd] type=${props.type} error`, event?.detail);
    emit("error", event);
}

async function open(): Promise<void> {
    if (props.type !== "reward" || isClicked.value || !resolvedUnitId.value) return;
    isClicked.value = true;
    try {
        const result = await playRewardAd({
            unitId: resolvedUnitId.value,
            retryConfirm: props.retryConfirm,
        });
        emit("close", {
            success: result.success,
            isEnded: result.isEnded,
            loadFailed: !result.success,
            error: result.error,
        });
    } finally {
        isClicked.value = false;
    }
}

defineExpose({ open });
</script>

<style scoped>
.hlw-ad {
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--surface-card, #ffffff);
}

.hlw-ad--reward {
    display: block;
    border-radius: 0;
    overflow: visible;
    background: transparent;
}

/* 格子广告：默认居中悬浮；微信硬性规则要求 wrapper 透明无圆角，customStyle 可覆盖 */
.hlw-ad--grid {
    position: fixed;
    z-index: 99;
    border-radius: 0;
    overflow: visible;
    background: transparent;
}

.hlw-ad--left-top {
    top: 24rpx;
    right: auto;
    bottom: auto;
    left: 24rpx;
    transform: none;
}

.hlw-ad--right-top {
    top: 24rpx;
    right: 24rpx;
    bottom: auto;
    left: auto;
    transform: none;
}

.hlw-ad--left-middle {
    top: 50%;
    right: auto;
    bottom: auto;
    left: 24rpx;
    transform: translateY(-50%);
}

.hlw-ad--right-middle {
    top: 50%;
    right: 24rpx;
    bottom: auto;
    left: auto;
    transform: translateY(-50%);
}

.hlw-ad--left-bottom {
    top: auto;
    right: auto;
    bottom: 200rpx;
    left: 24rpx;
    transform: none;
}

.hlw-ad--right-bottom {
    top: auto;
    right: 24rpx;
    bottom: 200rpx;
    left: auto;
    transform: none;
}

.hlw-ad--center {
    top: 50%;
    right: auto;
    bottom: auto;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>
