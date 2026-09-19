<template>
    <view v-if="show" class="hlw-modal-mask" @tap.self="onMask">
        <view class="hlw-modal" :class="{ 'hlw-modal--show': show }" @tap.stop>
            <view v-if="title" class="hlw-modal-title">{{ title }}</view>
            <view class="hlw-modal-body" :style="{ padding: props.bodyPadding }">
                <slot />
            </view>
            <slot name="footer">
                <view class="hlw-modal-footer">
                    <view
                        v-if="showCancel"
                        class="hlw-modal-btn hlw-modal-btn--cancel"
                        @tap.stop="onCancel"
                    >
                        {{ cancelText }}
                    </view>
                    <view class="hlw-modal-btn hlw-modal-btn--confirm" @tap.stop="onConfirm">
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
    showCancel?: boolean;
    confirmText?: string;
    cancelText?: string;
    closeOnMask?: boolean;
    /** 内容区内边距。默认 `32rpx`，需要自定义内容贴边时传 `"0"` */
    bodyPadding?: string;
}

const props = withDefaults(defineProps<Props>(), {
    show: false,
    title: "",
    showCancel: true,
    confirmText: "确定",
    cancelText: "取消",
    closeOnMask: true,
    bodyPadding: "32rpx",
});

const emit = defineEmits<{ "update:show": [value: boolean]; confirm: []; cancel: [] }>();

function close() {
    emit("update:show", false);
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
