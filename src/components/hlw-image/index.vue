<template>
    <image
        class="hlw-image"
        :src="src"
        :mode="mode"
        :lazy-load="lazyLoad"
        :show-menu-by-longpress="showMenuByLongpress"
        :webp="webp"
        :fade-show="fadeShow"
        :draggable="draggable"
        @load="$emit('load', $event)"
        @error="$emit('error', $event)"
        @tap="handleTap"
    />
</template>

<script setup lang="ts">
/**
 * HlwImage — 图片组件
 *
 * 默认继承原生 <image> 所有属性，额外支持点击大图预览（uni.previewImage）。
 *
 * @props
 *   src                  - 图片地址
 *   mode                 - 裁剪/缩放模式（同原生 image），默认 scaleToFill
 *   lazyLoad             - 懒加载
 *   showMenuByLongpress  - 长按弹出菜单（保存图片等）
 *   webp                 - 指定为 webp 格式
 *   fadeShow             - 淡入效果
 *   draggable            - H5 端可拖拽
 *   preview              - 点击是否弹出大图预览（uni.previewImage）
 *   previewList          - 预览组 URL 数组；传了则进入分组预览，current 定位 src
 *
 * @events
 *   load   - 原生 load
 *   error  - 原生 error
 *   tap    - 原生点击（不论是否 preview 都触发）
 *
 * @example
 * ```vue
 * <!-- 简单点击预览 -->
 * <hlw-image :src="url" preview />
 *
 * <!-- 分组预览：点击任一图进入，支持左右滑动切换 -->
 * <hlw-image :src="photo" preview :preview-list="photos" />
 * ```
 */

interface Props {
    /** 图片 URL（必填） */
    src: string;
    /** 裁剪/缩放模式；参见 uni 官方文档 */
    mode?:
        | "scaleToFill"
        | "aspectFit"
        | "aspectFill"
        | "widthFix"
        | "heightFix"
        | "top"
        | "bottom"
        | "center"
        | "left"
        | "right"
        | "top left"
        | "top right"
        | "bottom left"
        | "bottom right";
    /** 懒加载（仅小程序） */
    lazyLoad?: boolean;
    /** 长按弹出菜单（保存/转发等） */
    showMenuByLongpress?: boolean;
    /** 指定为 webp 格式 */
    webp?: boolean;
    /** 淡入显示 */
    fadeShow?: boolean;
    /** H5 端是否可拖拽 */
    draggable?: boolean;
    /** 点击是否弹出大图预览 */
    preview?: boolean;
    /** 预览组；传了则在预览里支持左右滑切换，current 自动定位 src */
    previewList?: string[];
}

const props = withDefaults(defineProps<Props>(), {
    mode: "scaleToFill",
    lazyLoad: false,
    showMenuByLongpress: false,
    webp: false,
    fadeShow: true,
    draggable: true,
    preview: false,
    previewList: () => [],
});

const emit = defineEmits<{
    (event: "tap", payload: unknown): void;
    (event: "load", payload: unknown): void;
    (event: "error", payload: unknown): void;
}>();

const handleTap = (event: unknown) => {
    emit("tap", event);
    if (!props.preview || !props.src) return;
    const urls = props.previewList.length > 0 ? props.previewList : [props.src];
    uni.previewImage({
        urls,
        current: props.src,
    });
};
</script>

<style lang="scss" scoped>
/**
 * 内部 image 默认填满宿主元素所分配的空间。
 * 父组件通过 class (如 .qr-img { width:360rpx; height:360rpx }) 只能控制 <hlw-image> host；
 * 由于 scoped 样式不穿透自定义组件，这里必须给内部 image 也设 100%，否则 mode 生效不了。
 */
.hlw-image {
    display: block;
    width: 100%;
    height: 100%;
}
</style>
