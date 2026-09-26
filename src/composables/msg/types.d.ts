/**
 * 提示图标型
 */
export type ToastIcon = "success" | "loading" | "error" | "none";

/**
 * 提示时长期
 */
export type ToastDuration = "short" | "long";

/**
 * 提示配置项
 */
export interface ToastOptions {
    /** 提示文内容 */
    message: string;
    /** 图标类型名 */
    icon?: ToastIcon;
    /** 图标资源图 */
    image?: string;
    /** 持续毫秒数 */
    duration?: number;
    /** 防透遮罩层 */
    mask?: boolean;
    /** 浮层位置项 */
    position?: "top" | "center" | "bottom";
}

/**
 * 确认对话项
 */
export interface ModalOptions {
    /** 弹窗标题文 */
    title?: string;
    /** 弹窗内容文 */
    content: string;
    /** 确认按钮字 */
    confirmText?: string;
    /** 取消按钮字 */
    cancelText?: string;
    /** 确认按钮色 */
    confirmColor?: string;
    /** 取消按钮色 */
    cancelColor?: string;
    /** 显取消按钮 */
    showCancel?: boolean;
}

/**
 * 消息门面体
 */
export interface HlwMsg {
    /** 显示轻提示 */
    toast(opts: ToastOptions | string): void;
    /** 成功提示框 */
    success(message: string): void;
    /** 失败提示框 */
    error(message: string): void;
    /** 显全局加载 */
    showLoading(message?: string): void;
    /** 隐全局加载 */
    hideLoading(): void;
    /** 弹出确认框 */
    modal(opts: ModalOptions): Promise<boolean>;
    /** 确认对话框 (modal 别名) */
    confirm(opts: ModalOptions): Promise<boolean>;
    /** 标题进度条 */
    setLoadingBar(progress: number): void;
}

