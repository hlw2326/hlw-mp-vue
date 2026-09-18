/**
 * 路由动作型
 */
export type NavigateType =
    | "navigateTo"
    | "redirectTo"
    | "switchTab"
    | "reLaunch"
    | "navigateBack"
    | "miniprogram"
    | "webview"
    | (string & {});

/**
 * 路由配置项
 */
export interface NavigateOptions {
    /** 静默不提示 */
    silent?: boolean;
    /** 跳转失败调 */
    onFail?: (message: string) => void;
    /** 返回上级数 */
    delta?: number;
    /** 外部小路径 */
    path?: string;
    /** 外部环境版 */
    envVersion?: "develop" | "trial" | "release";
    /** 额外附带数 */
    extraData?: Record<string, unknown>;
}
