<template>
    <template v-if="show">
        <view class="hlw-popup-mask" @tap.self="onClose" />
        <view
            class="hlw-popup"
            :class="[`hlw-popup--${position}`, { 'hlw-popup--round': round }]"
            @tap.stop
        >
            <view v-if="title || closable" class="hlw-popup-header">
                <text class="hlw-popup-title">{{ title }}</text>
                <view v-if="closable" class="hlw-popup-close i-fa6-solid-xmark" @tap="onClose" />
            </view>
            <slot />
        </view>
    </template>
</template>

<script setup lang="ts">
/**
 * HlwPopup — 基础遮罩弹窗组件
 *
 * 轻量级弹窗容器，支持从页面上、下、中等不同方位弹出。支持自定义圆角、头部标题及关闭按钮。
 *
 * @props
 *   show     - 是否展示弹窗，默认 false
 *   position - 弹窗滑出方向：top / center / bottom，默认 bottom
 *   round    - 是否启用圆角效果，默认 true
 *   closable - 是否展示关闭按钮，默认 true
 *   title    - 弹窗顶部的标题文字
 *
 * @events
 *   update:show - 双向绑定显示状态时触发
 *   close       - 弹窗关闭时触发
 *
 * @example
 * ```vue
 * <HlwPopup v-model:show="visible" title="协议内容" position="bottom">
 *     <view>这里是协议正文内容...</view>
 * </HlwPopup>
 * ```
 */
interface Props {
    show?: boolean;
    position?: "bottom" | "center" | "top";
    round?: boolean;
    closable?: boolean;
    title?: string;
}

withDefaults(defineProps<Props>(), {
    show: false,
    position: "bottom",
    round: true,
    closable: true,
    title: "",
});

const emit = defineEmits<{ "update:show": [value: boolean]; close: [] }>();

function onClose() {
    emit("update:show", false);
    emit("close");
}
</script>

<style lang="scss" scoped src="./popup.scss"></style>
