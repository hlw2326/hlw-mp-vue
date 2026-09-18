<template>
    <scroll-view class="hlw-tabs" :scroll-x="scrollable" :enhanced="true" :show-scrollbar="false">
        <view class="hlw-tabs-wrap" style="position: relative;">
            <view
                v-for="(item, index) in items"
                :key="index"
                class="hlw-tab"
                :class="{ 'hlw-tab--active': modelValue === index }"
                @tap="onChange(index)"
            >
                <text class="hlw-tab-text">{{ typeof item === "string" ? item : item.label }}</text>
                <view
                    v-if="typeof item !== 'string' && item.badge"
                    class="hlw-tab-badge"
                >{{ item.badge }}</view>
            </view>
            <!-- 唯一的一根滑动线条，放置在父容器下，以便做平移 (translateX) 动画 -->
            <view class="hlw-tab-line" :style="lineStyle" />
        </view>
    </scroll-view>
</template>

<script setup lang="ts">
/**
 * HlwTabs — 选项卡
 *
 * 横向选项卡切换，支持文字 / 对象配置、徽标和滚动模式。
 * 激活项跟随 --primary-color 主题色。
 *
 * @props
 *   modelValue - 当前选中索引，支持 v-model，默认 0
 *   items      - 选项列表：string[] 或 { label, badge? }[]
 *   scrollable - 超出时是否可横向滚动，默认 false
 *   lineWidth  - 底部指示线宽度，默认 40rpx
 *
 * @events
 *   update:modelValue - 切换时触发
 *   change            - 切换时触发（携带新索引）
 *
 * @example
 * ```vue
 * <HlwTabs v-model="activeTab" :items="['推荐', '热门', '最新']" />
 * <HlwTabs v-model="tab" :items="[{ label: '消息', badge: '3' }, { label: '关注' }]" />
 * ```
 */
import { computed } from "vue";
export type { HlwTabItem } from "./types";

interface Props {
    modelValue?: number;
    items?: (string | HlwTabItem)[];
    scrollable?: boolean;
    lineWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: 0,
    items: () => [],
    scrollable: false,
    lineWidth: "40rpx",
});

const emit = defineEmits<{ "update:modelValue": [index: number]; change: [index: number] }>();

// 计算滑动线条的位置
const lineStyle = computed(() => {
    const count = props.items?.length || 0;
    if (count === 0) return { display: 'none' };
    
    // 假设在非滚动模式下，每一项平分宽度，即 100% / count
    const tabWidthPercent = 100 / count;
    // 居中偏移百分比 = (选中索引 + 0.5) * 每项宽度百分比
    const leftOffset = (props.modelValue + 0.5) * tabWidthPercent;
    
    return {
        width: props.lineWidth,
        left: `${leftOffset}%`
    };
});

function onChange(index: number) {
    emit("update:modelValue", index);
    emit("change", index);
}
</script>

<style lang="scss" scoped>
.hlw-tabs {
    background: #fff;
    white-space: nowrap;
}

.hlw-tabs-wrap {
    display: inline-flex;
    min-width: 100%;
}

.hlw-tab {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx 28rpx;
    gap: 6rpx;
    transition: color 0.2s;

    &--active {
        .hlw-tab-text {
            color: var(--primary-color, #3b82f6);
            font-weight: 600;
        }
    }
}

.hlw-tab-text {
    font-size: var(--font-base, 30rpx);
    color: #64748b;
    transition: color 0.2s;
}

.hlw-tab-badge {
    padding: 0 8rpx;
    min-width: 28rpx;
    height: 28rpx;
    line-height: 28rpx;
    font-size: 18rpx;
    text-align: center;
    color: #fff;
    background: #ef4444;
    border-radius: 999rpx;
}

.hlw-tab-line {
    position: absolute;
    bottom: 6rpx;
    height: 6rpx;
    border-radius: 999rpx; /* 胶囊圆角 */
    background: var(--primary-color, #3b82f6);
    /* 居中定位 */
    transform: translateX(-50%);
    /* 在 left 变化时产生平移动画，采用缓动曲线 */
    transition: left 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
</style>
