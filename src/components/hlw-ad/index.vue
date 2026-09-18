<!--
    HlwAd — 小程序展示型广告原子组件
    ------------------------------------------------------------------
    用法（业务方从自己的接口配置取对应 unitId 传入）：
        hlw-ad type="banner" :unit-id="config.bannerUnitId"
        hlw-ad type="grid"   :unit-id="config.gridUnitId" placement="right-middle"
        hlw-ad type="custom" :unit-id="config.customUnitId"

    渲染分支：
      - banner        → ad type="banner" unit-id="..."（微信流量主自带样式）
      - grid / custom → ad-custom unit-id="..."（原生模板广告）

    video / reward / popup 不走这个组件：
      - reward / popup → 业务方自行调用小程序广告 API
      - video（贴片）须嵌在 video 标签内，业务侧自己用 <ad type="video">
-->
<template>
    <view
        v-if="visible"
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
import { computed } from "vue";
import { getAdUnitId } from "../../utils/ad";

defineOptions({ name: "HlwAd" });

type GridPlacement = "left-top" | "right-top" | "left-middle" | "right-middle" | "left-bottom" | "right-bottom" | "center";

interface Props {
    /** 广告类型 — 仅展示型（banner / grid / custom），默认 custom */
    type?: "banner" | "grid" | "custom";
    /** 微信广告单元 id；若未传则自动根据 type 从全局广告配置解析 */
    unitId?: string;
    /** grid 广告悬浮位置，默认 center */
    placement?: GridPlacement;
    /** 自定义样式（合并到根元素） */
    customStyle?: string;
    /** 自定义 class */
    customClass?: string;
    /** 圆角大小，默认 10rpx */
    radius?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: "custom",
    unitId: "",
    placement: "center",
    customStyle: "",
    customClass: "",
    radius: "10rpx",
});

const emit = defineEmits<{
    (e: "load", event: any): void;
    (e: "error", event: any): void;
}>();

const resolvedUnitId = computed(() => {
    if (props.unitId) return props.unitId;
    return getAdUnitId(props.type);
});

/** 有 unitId 才渲染 */
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

function onLoad(event: any) {
    emit("load", event);
}
function onError(event: any) {
    console.warn(`[HlwAd] type=${props.type} error`, event?.detail);
    emit("error", event);
}
</script>

<style scoped>
.hlw-ad {
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--surface-card, #ffffff);
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
