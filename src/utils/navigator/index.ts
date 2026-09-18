import { hlw } from "../../hlw";

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

type UniFail = { errMsg?: string };

/**
 * 集中处理跳转失败时的提示与回调。
 */
function fail(message: string, options: NavigateOptions = {}) {
    if (!options.silent) {
        hlw.$msg.toast(message);
    }
    options.onFail?.(message);
}

/**
 * 创建符合 uni-app 失败规范的回调处理函数。
 */
function failHandler(target: string, options: NavigateOptions = {}) {
    return (error?: UniFail) => {
        fail(error?.errMsg || `无法跳转：${target}`, options);
    };
}

/**
 * 核心的底层页面路由分发方法。
 * 
 * @param type 跳转动作类型
 * @param url 跳转目标路径或小程序 AppId
 * @param options 额外的控制参数
 */
export function navigate(type: NavigateType = "navigateTo", url = "", options: NavigateOptions = {}) {
    if (type === "navigateBack") {
        uni.navigateBack({ delta: options.delta || 1, fail: failHandler("返回上一页", options) });
        return;
    }

    if (!url) {
        fail("跳转目标未配置", options);
        return;
    }

    const onFail = failHandler(url, options);

    if (type === "redirectTo") {
        uni.redirectTo({ url, fail: onFail });
        return;
    }

    if (type === "switchTab") {
        uni.switchTab({ url, fail: onFail });
        return;
    }

    if (type === "reLaunch") {
        uni.reLaunch({ url, fail: onFail });
        return;
    }

    if (type === "miniprogram") {
        const openMiniProgram = uni.navigateToMiniProgram as
            | ((options: UniApp.NavigateToMiniProgramOptions) => void)
            | undefined;

        if (!openMiniProgram) {
            fail("当前平台不支持打开小程序", options);
            return;
        }

        openMiniProgram({
            appId: url,
            path: options.path || "",
            envVersion: options.envVersion || "release",
            extraData: options.extraData,
            fail: onFail,
        });
        return;
    }

    if (type === "webview") {
        fail(`H5：${url}`, options);
        return;
    }

    uni.navigateTo({ url, animationType: "none", fail: onFail });
}

/** 保留当前页面，跳转到应用内的某个页面 */
export function navigateTo(url: string, options?: NavigateOptions) {
    return navigate("navigateTo", url, options);
}

/** 关闭当前页面，跳转到应用内的某个页面 */
export function redirectTo(url: string, options?: NavigateOptions) {
    return navigate("redirectTo", url, options);
}

/** 跳转到 switchTab 页面，并关闭其他所有非 tabBar 页面 */
export function switchTab(url: string, options?: NavigateOptions) {
    return navigate("switchTab", url, options);
}

/** 关闭所有页面，打开到应用内的某个页面 */
export function reLaunch(url: string, options?: NavigateOptions) {
    return navigate("reLaunch", url, options);
}

/** 关闭当前页面，返回上一页面或多级页面 */
export function navigateBack(delta = 1, options: NavigateOptions = {}) {
    return navigate("navigateBack", "", { ...options, delta });
}

/** 打开另一个小程序 */
export function navigateToMiniProgram(appId: string, options?: NavigateOptions) {
    return navigate("miniprogram", appId, options);
}
