<template>
    <view v-if="props.show" class="hlw-add-mini" :style="{ top }">
        <view class="hlw-add-mini__arrow" :style="arrowStyle" />
        <view class="hlw-add-mini__content">
            <view class="hlw-add-mini__text">
                <view class="hlw-add-mini__title">{{ props.title }}</view>
                <view v-if="props.desc" class="hlw-add-mini__desc">{{ props.desc }}</view>
            </view>
            <view class="hlw-add-mini__close" @tap="close">×</view>
        </view>
    </view>
</template>

<script setup lang="ts">
/**
 * HlwAddMini - 添加小程序提示气泡组件
 *
 * 用于提示用户点击右上角将当前小程序“添加到我的小程序”中，以提升用户留存。
 * 会根据是否为自定义导航栏（custom），自动调整气泡浮动位置（避开胶囊按钮与状态栏）。
 */
import { computed, ref, onMounted } from "vue";
import { getDevice } from "../../request";

defineOptions({ name: "HlwAddMini" });

interface Props {
    /** 是否显示提示气泡 */
    show?: boolean;
    /** 气泡主标题文字 */
    title?: string;
    /** 气泡副标题/描述文字 */
    desc?: string;
}

const props = withDefaults(defineProps<Props>(), {
    show: false,
    title: "添加到我的小程序",
    desc: "点击右上角 ··· 添加",
});

const emit = defineEmits<{
    /** 点击关闭按钮时触发 */
    close: [];
}>();

// 从 getDevice 获取缓存的设备系统信息，规避在 computed 中频繁调用同步系统 API 的性能问题
const info = getDevice();

const isCustomNav = ref(false);

onMounted(() => {
    // 1. 全局配置探测（针对全局自定义导航样式，可立即识别，免去生命周期时序竞态问题）
    try {
        if (typeof __wxConfig !== "undefined") {
            // @ts-ignore
            const globalStyle = __wxConfig.globalStyle?.navigationStyle || __wxConfig.global?.window?.navigationStyle;
            if (globalStyle === "custom") {
                isCustomNav.value = true;
                return;
            }
        }
    } catch (error) {
        // 容错
    }

    // 2. 延迟探测（避开组件挂载时 getCurrentPages 尚未完全初始化的竞态，并且使用非破坏性读取）
    setTimeout(() => {
        try {
            const pages = getCurrentPages();
            if (pages && pages.length > 0) {
                const page = pages[pages.length - 1];
                // @ts-ignore - 微信小程序原生属性或 uni-app 底层元数据配置
                const style = page.__wxConfig?.navigationStyle || page?.$page?.meta?.navigationStyle;
                if (style === "custom") {
                    isCustomNav.value = true;
                }
            }
        } catch (error) {
            // 容错
        }
    }, 100);
});

const top = computed(() => {
    if (isCustomNav.value) {
        try {
            const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
            if (menuButtonInfo && menuButtonInfo.bottom > 0) {
                // 胶囊底部高度 + 12px 作为气泡定位的顶部基准，避免箭头与胶囊重叠
                return `${menuButtonInfo.bottom + 12}px`;
            }
        } catch (error) {
            // 跨端环境不支持或报错时，执行安全降级计算
        }
        return `${info.statusBarHeight + 50}px`;
    }
    return "6px";
});

const arrowStyle = computed(() => {
    try {
        const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
        if (menuButtonInfo && menuButtonInfo.width > 0) {
            // 胶囊左边缘 + 胶囊宽度的 28% (即三点按钮的中心点)
            const dotsCenterX = menuButtonInfo.left + menuButtonInfo.width * 0.28;
            // 屏幕宽度 - 胶囊三点中心点 = 三点中心点到屏幕右边缘的像素距离
            const arrowRightPx = info.windowWidth - dotsCenterX;
            // 气泡右边缘到屏幕右边缘的像素距离 (22rpx)
            const bubbleRightPx = uni.upx2px(22);
            // 箭头相对于气泡右侧边缘的像素偏移 (再减去箭头自身半宽 12rpx 对应的 px 像素)
            const arrowHalfWidthPx = uni.upx2px(12);
            const rightOffset = arrowRightPx - bubbleRightPx - arrowHalfWidthPx;

            return {
                right: `${rightOffset}px`,
            };
        }
    } catch (error) {
        // 容错降级
    }
    return {};
});

/**
 * 触发关闭气泡事件。
 */
function close() {
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
