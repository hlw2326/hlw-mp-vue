<template>
    <view v-if="show" class="hlw-modal-mask" :style="{ zIndex }" @tap.self="onMask">
        <view
            class="hlw-modal"
            :class="{ 'hlw-modal--show': show }"
            :style="[width ? { width, maxWidth: width } : {}]"
            @tap.stop
        >
            <view v-if="title || closable" class="hlw-modal-header">
                <view v-if="title" class="hlw-modal-title">{{ title }}</view>
                <view v-if="closable" class="hlw-modal-close" @tap="close">
                    <text class="i-fa6-solid-xmark hlw-modal-close-icon" />
                </view>
            </view>
            <view class="hlw-modal-body" :style="{ padding: props.bodyPadding }">
                <slot />
            </view>
            <slot name="footer">
                <view v-if="showFooter" class="hlw-modal-footer">
                    <view
                        v-if="showCancel"
                        class="hlw-modal-btn hlw-modal-btn--cancel"
                        @tap.stop="onCancel"
                    >
                        {{ cancelText }}
                    </view>
                    <view
                        v-if="showConfirm"
                        class="hlw-modal-btn hlw-modal-btn--confirm"
                        @tap.stop="onConfirm"
                    >
                        {{ confirmText }}
                    </view>
                </view>
            </slot>
        </view>
    </view>
</template>

<script setup lang="ts">
interface Props {
    show?: boolean;
    title?: string;
    closable?: boolean;
    showFooter?: boolean;
    showCancel?: boolean;
    showConfirm?: boolean;
    confirmText?: string;
    cancelText?: string;
    closeOnMask?: boolean;
    width?: string;
    zIndex?: number | string;
    /** 内容区内边距。默认 `28rpx 32rpx`，需要自定义内容贴边时传 `"0"` */
    bodyPadding?: string;
}

const props = withDefaults(defineProps<Props>(), {
    show: false,
    title: "",
    closable: false,
    showFooter: true,
    showCancel: true,
    showConfirm: true,
    confirmText: "确定",
    cancelText: "取消",
    closeOnMask: true,
    width: "",
    zIndex: 1000,
    bodyPadding: "28rpx 32rpx",
});

const emit = defineEmits<{
    "update:show": [value: boolean];
    confirm: [];
    cancel: [];
    close: [];
}>();

function close() {
    emit("update:show", false);
    emit("close");
}

function onMask() {
    if (!props.closeOnMask) return;
    close();
}

function onConfirm() {
    emit("confirm");
    close();
}

function onCancel() {
    emit("cancel");
    close();
}
</script>

<style lang="scss" scoped src="./modal.scss"></style>
