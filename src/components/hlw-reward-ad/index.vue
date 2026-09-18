<template>
    <view v-if="resolvedUnitId" class="hlw-reward-ad" @tap="open">
        <slot />
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { getAdUnitId, playRewardAd } from "../../utils/ad";
import type { HlwRewardAdResult } from "./types";

defineOptions({ name: "HlwRewardAd" });

interface Props {
    /** 广告单元号 */
    unitId?: string;
    /** 退出重试否 */
    retryConfirm?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    unitId: "",
    retryConfirm: true,
});

const emit = defineEmits<{
    (event: "close", result: HlwRewardAdResult): void;
}>();

const isClicked = ref(false);
const resolvedUnitId = computed(() => props.unitId || getAdUnitId("reward"));

async function open(): Promise<void> {
    if (isClicked.value || !resolvedUnitId.value) return;
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
.hlw-reward-ad {
    display: block;
}
</style>
