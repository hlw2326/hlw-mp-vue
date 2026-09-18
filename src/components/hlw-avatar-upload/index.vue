<template>
    <view class="hlw-avatar-upload">
        <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar" @click="onClick">
            <slot />
        </button>
    </view>
</template>

<script setup lang="ts">
defineOptions({ name: "HlwAvatarUpload" });

const emit = defineEmits<{
    (event: "onAvatar", filePath: string): void;
}>();

function onChooseAvatar(event: any) {
    const filePath = String(event?.detail?.avatarUrl || "");
    if (filePath) {
        emit("onAvatar", filePath);
    }
}

function onClick() {
    // #ifndef MP-WEIXIN
    uni.chooseImage({
        count: 1,
        success: (res) => {
            const filePath = res.tempFilePaths[0];
            if (filePath) {
                emit("onAvatar", filePath);
            }
        },
    });
    // #endif
}
</script>

<style scoped>
.hlw-avatar-upload {
    display: block;
    width: 100%;
    height: 100%;
}

.avatar-wrapper {
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background: transparent;
    line-height: normal;
    border: none;
    overflow: visible;
    cursor: pointer;
}

.avatar-wrapper::after {
    border: none;
    display: none;
}
</style>
