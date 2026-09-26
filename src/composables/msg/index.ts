import type {
    ToastIcon,
    ToastDuration,
    ToastOptions,
    ModalOptions,
    HlwMsg,
} from "./types";

export type {
    ToastIcon,
    ToastDuration,
    ToastOptions,
    ModalOptions,
    HlwMsg,
};

/**
 * 统一的消息提示与弹窗能力 hook。
 * 
 * @example
 * ```ts
 * const msg = useMsg();
 * msg.toast('操作成功');
 * msg.showLoading('保存中...');
 * const ok = await msg.confirm({ content: '确定删除吗？' });
 * ```
 */
export function useMsg(): HlwMsg {
    /**
     * 显示普通 toast，支持字符串或完整配置。
     */
    function toast(opts: ToastOptions | string) {
        const {
            message,
            icon = "none",
            image = undefined,
            duration = 2000,
            mask = false,
            position = "center",
        } = typeof opts === "string" ? { message: opts } : opts;

        uni.showToast({
            title: message,
            icon,
            image,
            duration,
            mask,
            position,
        });
    }

    /**
     * 显示成功提示。
     */
    function success(message: string) {
        uni.showToast({ title: message, icon: "success", duration: 2000 });
    }

    /**
     * 显示失败提示。
     */
    function error(message: string) {
        uni.showToast({ title: message, icon: "error", duration: 2000 });
    }

    /**
     * 显示全局 loading。
     */
    function showLoading(message = "加载中...") {
        uni.showLoading({ title: message, mask: true });
    }

    /**
     * 关闭全局 loading。
     */
    function hideLoading() {
        uni.hideLoading();
    }

    /**
     * 弹出确认窗
     */
    function modal(opts: ModalOptions): Promise<boolean> {
        return new Promise((resolve) => {
            const {
                title = "提示",
                content,
                confirmText = "确定",
                cancelText = "取消",
                confirmColor = "#3b82f6",
                cancelColor = "#999999",
                showCancel = true,
            } = opts;
            uni.showModal({
                title,
                content,
                confirmText,
                cancelText,
                confirmColor,
                cancelColor,
                showCancel,
                success: (res) => resolve(res.confirm),
                fail: () => resolve(false),
            });
        });
    }

    /**
     * 标题进度条
     */
    function setLoadingBar(progress: number) {
        const clamped = Math.max(0, Math.min(100, progress));
        const filled = Math.round(clamped / 2);
        uni.setNavigationBarTitle({
            title: `${"■".repeat(filled)}${"□".repeat(50 - filled)} ${clamped}%`,
        });
    }

    return {
        toast,
        success,
        error,
        showLoading,
        hideLoading,
        modal,
        confirm: modal,
        setLoadingBar,
    };
}

