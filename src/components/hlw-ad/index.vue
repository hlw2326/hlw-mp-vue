<template>
    <!-- 激励广告 -->
    <view
        v-if="type === 'reward' && isReady"
        class="hlw-ad hlw-ad--reward"
        :class="customClass"
        :style="customStyle"
        @tap="open"
    >
        <slot />
    </view>

    <!-- 展示广告 -->
    <view
        v-else-if="isReady"
        class="hlw-ad"
        :class="[`hlw-ad--${type}`, type === 'grid' ? `hlw-ad--${placement}` : '', customClass]"
        :style="customStyle"
    >
        <ad-custom
            :unit-id="finalUnitId"
            @load="onLoad"
            @error="onError"
            @close="onClose"
        />
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { getAdUnitId, playRewardAd } from "../../utils/ad";
import type { HlwAdType, HlwGridPlacement, HlwRewardAdResult } from "./types";

defineOptions({ name: "HlwAd" });

interface Props {
    /** 广告类型 */
    type?: HlwAdType;
    /** 单元标识 */
    unitId?: string;
    /** 悬浮定位 */
    placement?: HlwGridPlacement;
    /** 自定类名 */
    customClass?: string;
    /** 自定样式 */
    customStyle?: string;
    /** 退出重试 */
    retryConfirm?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    type: "custom",
    unitId: undefined,
    placement: "center",
    customClass: "",
    customStyle: "",
    retryConfirm: true,
});

const emit = defineEmits<{
    (event: "load", detail: unknown): void;
    (event: "error", detail: unknown): void;
    (event: "close", result?: unknown): void;
}>();

const isClicked = ref(false);

const finalUnitId = computed(() => {
    // 显式传参
    if (props.unitId !== undefined) {
        return props.unitId.trim();
    }
    // 全局配置
    return getAdUnitId(props.type);
});

const isReady = computed(() => !!finalUnitId.value);

function onLoad(event: unknown): void {
    emit("load", event);
}

function onError(event: unknown): void {
    emit("error", event);
}

function onClose(event: unknown): void {
    emit("close", event);
}

async function open(): Promise<void> {
    if (props.type !== "reward" || isClicked.value || !finalUnitId.value) return;
    isClicked.value = true;
    try {
        const result = await playRewardAd({
            unitId: finalUnitId.value,
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

<style scoped lang="scss">
.hlw-ad {
    width: 100%;
    background: transparent;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;

    ad-custom {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: auto 0;
    }
}

.hlw-ad--reward {
    display: inline-block;
    width: auto;
}

.hlw-ad--grid {
    position: fixed;
    z-index: 99;
    width: auto;
}

.hlw-ad--left-top {
    top: 24rpx;
    left: 24rpx;
}

.hlw-ad--right-top {
    top: 24rpx;
    right: 24rpx;
}

.hlw-ad--left-middle {
    top: 50%;
    left: 24rpx;
    transform: translateY(-50%);
}

.hlw-ad--right-middle {
    top: 50%;
    right: 24rpx;
    transform: translateY(-50%);
}

.hlw-ad--left-bottom {
    bottom: 200rpx;
    left: 24rpx;
}

.hlw-ad--right-bottom {
    bottom: 200rpx;
    right: 24rpx;
}

.hlw-ad--center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>
