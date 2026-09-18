<template>
    <view class="navbar" :class="[props.border ? '' : 'no-border']">
        <view :style="barStyle"></view>
        <view class="header" :style="{ height: headerHeight + 'px' }" :class="['align-' + props.titleAlign, props.isBack ? 'has-back' : '']">
            <view @tap="tapBack" class="left" v-if="props.isBack">
                <span class="i-fa6-solid-chevron-left icon-left"></span>
            </view>
            <text class="title" :style="titleCustomStyle">{{ title }}</text>
        </view>
    </view>
    <view :style="{ height: navbarHeight + 'px' }"></view>
</template>

<script lang="ts" setup>
/**
 * HlwNavBar — 自定义导航栏组件
 *
 * 自适应状态栏高度与胶囊按钮，完美替代微信小程序原生导航栏。支持不同主题配色、返回按钮及自适应高度。
 *
 * @props
 *   title       - 导航栏标题文字
 *   isBack      - 是否显示返回按钮，默认 false；点击自动回退或回到首页
 *   isBar       - 是否占用状态栏高度，默认 true
 *   titleAlign  - 标题对齐方式，'left' | 'center'
 *   titleSize   - 标题字体大小，支持 CSS 单位或变量
 *   titleStyle  - 标题字体，如 'sans-serif'
 *   titleWeight - 标题字重，如 '500' | 'bold'
 *   border      - 是否显示下边框（下划线），默认 true
 *
 * @example
 * ```vue
 * <hlw-nav-bar title="设置中心" is-back />
 * ```
 */
import { computed, ref } from "vue";

const statusBarHeight: number = uni.getSystemInfoSync()?.statusBarHeight || 0;
let menuButtonInfo: any = null;
try {
    menuButtonInfo = uni.getMenuButtonBoundingClientRect();
} catch (e) {
    console.warn(e);
}

const props = defineProps({
    isBar: {
        type: Boolean,
        default: true,
    },
    title: {
        type: String,
        default: "",
    },
    isBack: {
        type: Boolean,
        default: false,
    },
    titleAlign: {
        type: String,
        default: "center", // 'left' | 'center'
    },
    titleSize: {
        type: String,
        default: "",
    },
    titleStyle: {
        type: String,
        default: "",
    },
    titleWeight: {
        type: String,
        default: "500",
    },
    border: {
        type: Boolean,
        default: true,
    },
});

const titleCustomStyle = computed(() => {
    const style: Record<string, string> = {};
    if (props.titleSize) {
        style["font-size"] = props.titleSize;
    }
    if (props.titleStyle) {
        style["font-family"] = props.titleStyle;
    }
    if (props.titleWeight) {
        style["font-weight"] = props.titleWeight;
    }
    return style;
});

const barStyle = computed(() => {
    const style = {
        height: statusBarHeight + "px",
    };
    return style;
});

const headerHeight = ref<number>(44);
if (menuButtonInfo && typeof menuButtonInfo.bottom === "number" && menuButtonInfo.bottom > 0) {
    headerHeight.value = menuButtonInfo.bottom - statusBarHeight + 6;
}
const navbarHeight = ref(headerHeight.value + statusBarHeight);

function tapBack() {
    uni.navigateBack({
        fail: (err) => {
            uni.reLaunch({
                url: "/pages/index/index",
            });
        },
    });
}
</script>

<style lang="scss" scoped>
.navbar {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    width: 750rpx;
    z-index: 999;
    background-color: var(--navbar-bg-color, #ffffff);
    border-bottom: var(--navbar-border-bottom, none);
    transition:
        background-color 0.2s ease,
        border-bottom 0.2s ease;

    &.no-border {
        border-bottom: none !important;
    }

    .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 100%;

        &.align-left {
            justify-content: flex-start;
            padding-left: 32rpx;

            &.has-back {
                padding-left: 100rpx;
            }
        }

        &.align-center {
            justify-content: center;
        }

        .left {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            left: 0rpx;
            width: 100rpx;
            height: 100%;

            .icon-left {
                font-size: 30rpx;
                color: var(--text-primary, #303048);
            }
        }

        .title {
            font-size: var(--navbar-font-size, var(--font-md, 34rpx));
            font-family: var(--navbar-font-family, inherit);
            letter-spacing: 3rpx;
            font-weight: 500;
            color: var(--text-primary, #303048);
        }
    }
}
</style>
