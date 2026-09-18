<template>
    <video
        :src="props.src"
        class="hlw-video-element"
        autoplay
        loop
        muted
        :controls="false"
        :show-play-btn="false"
        :enable-play-gesture="true"
        object-fit="contain"
        :style="{ height: videoHeight }"
        @loadedmetadata="onVideoLoadedMetadata"
    />
</template>

<script setup lang="ts">
import { ref } from "vue";

defineOptions({ name: "HlwVideo" });

interface Props {
    /** 视频源 URL */
    src: string;
}

const props = withDefaults(defineProps<Props>(), {
    src: "",
});

const videoHeight = ref("450rpx");

function onVideoLoadedMetadata(event: any) {
    const { width, height } = event?.detail || {};
    if (width && height) {
        videoHeight.value = `${(height / width) * 750}rpx`;
    }
}
</script>

<style scoped>
.hlw-video-element {
    width: 100%;
    display: block;
}
</style>
