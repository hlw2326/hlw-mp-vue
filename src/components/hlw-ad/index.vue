<template>
    <hlw-ad-base v-bind="$attrs">
        <slot />
    </hlw-ad-base>
</template>

<script setup lang="ts">
import HlwAdBase from "../hlw-ad-base/index.vue";

defineOptions({ name: "HlwAd" });
</script>
