<template>
    <view class="hlw-nickname" @tap="openDialog">
        <slot>
            <text class="hlw-nickname__text">{{ props.text || '微信用户' }}</text>
        </slot>

        <!-- 修改昵称弹窗 -->
        <root-portal v-if="showEditNicknameDialog">
            <view class="nickname-modal" @tap="closeDialog">
                <view class="nickname-dialog" @tap.stop>
                    <view class="dialog-title">修改昵称</view>
                    <view class="dialog-input-wrapper">
                        <input 
                            class="dialog-input" 
                            type="nickname" 
                            v-model="tempNickname" 
                            placeholder="请输入或获取微信昵称" 
                            @blur="onNicknameBlur"
                            @input="onNicknameInput"
                        />
                    </view>
                    <view class="dialog-actions">
                        <button class="dialog-btn cancel-btn" @tap="closeDialog">取消</button>
                        <button class="dialog-btn confirm-btn" @tap="confirmNickname">确定</button>
                    </view>
                </view>
            </view>
        </root-portal>
    </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineOptions({ name: "HlwNickname" });

interface Props {
    /** 当前展示的昵称 */
    text?: string;
}

const props = withDefaults(defineProps<Props>(), {
    text: "",
});

const emit = defineEmits<{
    (event: "onNick", nickname: string): void;
}>();

const showEditNicknameDialog = ref(false);
const tempNickname = ref("");

function openDialog() {
    tempNickname.value = props.text || "";
    showEditNicknameDialog.value = true;
}

function closeDialog() {
    showEditNicknameDialog.value = false;
}

function onNicknameInput(event: any) {
    tempNickname.value = event?.detail?.value || "";
}

function onNicknameBlur(event: any) {
    // 微信小程序特有：点击键盘上方微信昵称 suggestion 时，会触发 blur 并带上值
    const value = event?.detail?.value || "";
    if (value) {
        tempNickname.value = value;
    }
}

function confirmNickname() {
    const nickname = tempNickname.value?.trim();
    if (!nickname) {
        hlw.$msg.toast("昵称不能为空");
        return;
    }
    if (nickname.length > 20) {
        hlw.$msg.toast("昵称长度不能超过 20 个字符");
        return;
    }
    emit("onNick", nickname);
    closeDialog();
}
</script>

<style scoped>
.hlw-nickname {
    display: inline-block;
}

/* 弹窗遮罩 */
.nickname-modal {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8rpx);
    animation: fadeIn 0.2s ease-out;
}

/* 弹窗主体 */
.nickname-dialog {
    width: 600rpx;
    padding: 40rpx;
    border-radius: var(--radius-lg, 30rpx);
    background: #ffffff;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.25);
    animation: scaleIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialog-title {
    margin-bottom: 30rpx;
    color: #1e293b;
    text-align: center;
    font-size: var(--font-md, 34rpx);
    font-weight: 600;
    letter-spacing: 1rpx;
}

.dialog-input-wrapper {
    margin-bottom: 40rpx;
    padding: 20rpx 24rpx;
    border: 2rpx solid #e2e8f0;
    border-radius: var(--radius-md, 16rpx);
    background: #f8fafc;
}

.dialog-input {
    width: 100%;
    height: 48rpx;
    color: #1e293b;
    font-size: var(--font-base, 30rpx);
    text-align: left;
}

.dialog-actions {
    display: flex;
    gap: 20rpx;
}

.dialog-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80rpx;
    margin: 0;
    font-size: var(--font-base, 30rpx);
    font-weight: 500;
    border-radius: var(--radius-md, 16rpx);
}

.dialog-btn::after {
    border: 0;
}

.cancel-btn {
    background: #f1f5f9;
    color: #64748b;
}

.confirm-btn {
    background: #3b82f6;
    color: #ffffff;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}
</style>
