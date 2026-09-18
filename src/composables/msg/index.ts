/**
 * useMsg - 消息提示 composable
 * 封装并统一小程序原生的 Toast、Loading 与模态弹窗 API。
 */

/** Toast 支持的图标类型 */
export type ToastIcon = "success" | "loading" | "error" | "none" | "fail" | "exception";
/** Toast 持续时间的预设档位 */
export type ToastDuration = "short" | "long";

/**
 * Toast 轻提示配置项。
 */
export interface ToastOptions {
    /** 提示的消息内容 */
    message: string;
    /** 显示的图标类型，默认为 'none' */
    icon?: ToastIcon;
    /** 自定义图标的本地/网络图片路径（如传入，将忽略 icon 属性） */
    image?: string;
    /** 持续时间，单位毫秒，默认 2000ms */
    duration?: number;
    /** 是否显示透明蒙层防止穿透点击，默认 false */
    mask?: boolean;
    /** 提示框的悬浮位置，仅在某些平台下生效 */
    position?: "top" | "center" | "bottom";
}

/**
 * 模态确认对话框配置项。
 */
export interface ModalOptions {
    /** 弹窗标题，默认 '提示' */
    title?: string;
    /** 弹窗内容 */
    content: string;
    /** 确认按钮的文字，默认 '确定' */
    confirmText?: string;
    /** 取消按钮的文字，默认 '取消' */
    cancelText?: string;
    /** 确认按钮的文字颜色，默认使用主题蓝色 */
    confirmColor?: string;
    /** 取消按钮的文字颜色，默认灰色 */
    cancelColor?: string;
    /** 是否显示取消按钮，若为 false 则只有确认按钮，默认 true */
    showCancel?: boolean;
}

/**
 * useMsg 返回的方法与接口实例。
 */
export interface HlwMsg {
    /** 显示普通 Toast 轻提示，支持配置对象或纯文本 */
    toast(opts: ToastOptions | string): void;
    /** 显示成功提示 (含成功图标) */
    success(message: string): void;
    /** 显示失败提示 (含错误图标) */
    error(message: string): void;
    /** 显示失败提示 (含错误图标) —— error 方法的别名 */
    fail(message: string): void;
    /** 显示全局模态 Loading 状态，默认显示 "加载中..." */
    showLoading(message?: string): void;
    /** 关闭全局 Loading 状态 */
    hideLoading(): void;
    /** 弹出确认模态框，返回 Promise<boolean> 代表用户是否点击了“确认” */
    confirm(opts: ModalOptions): Promise<boolean>;
    /** 弹出确认模态框 —— confirm 方法的别名 */
    modal(opts: ModalOptions): Promise<boolean>;
    /** 利用手机端导航栏标题动态展现一个文本模拟的进度条 */
    setLoadingBar(progress: number): void;
}

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

        // 兼容映射旧版自定义失败图标到标准 error 图标
        const mappedIcon = (icon === "fail" || icon === "exception") ? "error" : icon;

        uni.showToast({
            title: message,
            icon: mappedIcon as "success" | "loading" | "error" | "none",
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
     * 显示确认弹窗，返回用户是否点击确认。
     */
    function confirm(opts: ModalOptions): Promise<boolean> {
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
     * 通过标题文本模拟简单进度条展示。
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
        fail: error,
        showLoading,
        hideLoading,
        confirm,
        modal: confirm,
        setLoadingBar,
    };
}
