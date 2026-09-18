<template>
    <view class="search-bar" :style="background ? { backgroundColor: background } : {}">
        <view class="input-wrapper" :class="{ 'input-wrapper--round': shape === 'round' }">
            <view class="search-icon-wrapper">
                <text :class="searchIcon" class="search-icon" />
            </view>
            <view class="search-input-container">
                <input
                    class="search-input"
                    type="text"
                    :value="keyword"
                    :placeholder="placeholder"
                    :disabled="disabled"
                    confirm-type="search"
                    @input="onInput"
                    @confirm="onConfirm"
                    @focus="$emit('focus')"
                    @blur="$emit('blur')"
                />
                <view v-if="clearable && keyword" class="clear-icon-wrapper" @tap="onClear">
                    <text class="action-text">清空</text>
                </view>
                <view v-else-if="showPaste" class="paste-icon-wrapper" @tap="onPaste">
                    <text class="action-text">粘贴</text>
                </view>
            </view>
            <template v-if="showButton">
                <view class="divider" />
                <view class="search-btn-text" :style="textStyle" @tap="handleSearch">
                    {{ buttonText }}
                </view>
            </template>
        </view>
    </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { hlw } from "../../hlw";

interface Props {
    modelValue?: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    showPaste?: boolean;
    showButton?: boolean;
    buttonText?: string;
    buttonBg?: string;
    buttonColor?: string;
    shape?: "square" | "round";
    background?: string;
    type?: string;
    icon?: string | string[];
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: "",
    value: "",
    placeholder: "输入主页分享链接进行查询",
    disabled: false,
    clearable: true,
    showPaste: true,
    showButton: true,
    buttonText: "查询",
    buttonBg: "",
    buttonColor: "",
    shape: "square",
    background: "#ffffff",
    type: "",
    icon: "",
});

const emit = defineEmits<{
    (event: "update:modelValue", value: string): void;
    (event: "update:value", value: string): void;
    (event: "search", value: string): void;
    (event: "clear"): void;
    (event: "paste", value: string): void;
    (event: "focus"): void;
    (event: "blur"): void;
}>();

const keyword = computed({
    get: () => (props.value !== "" ? props.value : (props.modelValue || "")),
    set: (value: string) => {
        emit("update:modelValue", value);
        emit("update:value", value);
    },
});

const searchIcon = computed(() => {
    if (props.icon) return props.icon;
    switch (props.type) {
        case "ks":
            return ["iconfont", "icon-kwai"];
        case "bilibili":
        case "bili":
            return ["iconfont", "icon-bili"];
        case "sph":
        case "shipinhao":
            return ["iconfont", "icon-shipinhao"];
        case "dy":
        case "douyin":
            return ["iconfont", "icon-douyin"];
        default:
            return props.type ? ["iconfont", `icon-${props.type}`] : "i-fa6-solid-magnifying-glass";
    }
});

const textStyle = computed(() => {
    const styles: Record<string, string> = {};
    if (props.buttonColor) styles.color = props.buttonColor;
    if (props.buttonBg) styles.backgroundColor = props.buttonBg;
    return styles;
});

function onInput(event: any): void {
    keyword.value = event?.detail?.value ?? "";
}

function onClear(): void {
    keyword.value = "";
    emit("clear");
}

function handleSearch(): void {
    emit("search", keyword.value);
}

function onConfirm(event: any): void {
    const value = event?.detail?.value ?? keyword.value;
    keyword.value = value;
    emit("search", value);
}

function onPaste(): void {
    uni.getClipboardData({
        success: (res: any) => {
            const value = res?.data?.trim();
            if (value) {
                keyword.value = value;
                emit("paste", value);
                hlw.$msg.toast("已粘贴剪贴板内容");
            } else {
                hlw.$msg.toast("剪贴板为空");
            }
        },
        fail: () => {
            hlw.$msg.toast("读取剪贴板失败");
        },
    });
}
</script>

<style scoped lang="scss">
.search-bar {
    background-color: #ffffff;
    padding: 26rpx;
    border-bottom: 1rpx solid #eee;

    .input-wrapper {
        background-color: #ebebeb;
        border-radius: 10rpx;
        flex: 1;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        height: 88rpx;
        box-sizing: border-box;

        &--round {
            border-radius: 999rpx;
        }

        .search-icon-wrapper {
            padding: 0 20rpx;
            color: #969696;
            display: flex;
            align-items: center;
            justify-content: center;

            .search-icon {
                font-size: 36rpx;
            }
        }

        .search-input-container {
            flex: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            position: relative;

            .search-input {
                height: 88rpx;
                line-height: 88rpx;
                flex: 1;
                font-size: 26rpx;
                color: #111827;
                background-color: transparent;
                border: none;
                outline: none;
                box-sizing: border-box;
                letter-spacing: 1rpx;
            }

            .clear-icon-wrapper,
            .paste-icon-wrapper {
                color: #9ca3af;
                padding: 0 16rpx;
                z-index: 998;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s ease;
                white-space: nowrap;

                &:active {
                    color: var(--primary-color, #08c060);
                }

                .action-text {
                    font-size: 24rpx;
                    color: #9ca3af;
                    letter-spacing: 1rpx;
                    font-weight: 500;
                }
            }
        }

        .divider {
            height: 36rpx;
            width: 2rpx;
            background-color: #b6b6b6;
            margin-left: 20rpx;
        }

        .search-btn-text {
            padding: 0 20rpx;
            margin: 0;
            border: 0;
            background-color: transparent;
            font-size: 28rpx;
            letter-spacing: 5rpx;
            color: #111827;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;

            &:active {
                opacity: 0.7;
            }
        }
    }
}
</style>
