import {
    onShareAppMessage as registerShareAppMessage,
    onShareTimeline as registerShareTimeline,
} from "@dcloudio/uni-app";

/**
 * 分享卡片配置项。
 */
export interface ShareConfig {
    /** 分享的标题，默认使用小程序名称 */
    title?: string;
    /** 分享的页面路径，支持携带 query 参数，如 '/pages/index/index?id=123' */
    path?: string;
    /** 分享卡片的展示图 URL 或本地路径 */
    imageUrl?: string;
}

/**
 * 支持静态配置或动态解析器函数。
 */
export type ShareConfigResolver = ShareConfig | (() => ShareConfig);

/**
 * 分享操作句柄接口。
 */
export interface ShareHandlers {
    /**
     * 手动触发分享好友设置。
     * @param config 可选的额外覆盖分享配置
     */
    onShareAppMessage: (config?: ShareConfigResolver) => void;
    /**
     * 手动触发分享朋友圈设置。
     * @param config 可选的额外覆盖分享配置
     */
    onShareTimeline: (config?: ShareConfigResolver) => void;
    /**
     * 显示分享菜单项，启用小程序右上角分享。
     */
    showShareMenu: () => void;
}

/**
 * 解析分享配置。
 */
function resolveConfig(config?: ShareConfigResolver): ShareConfig {
    return typeof config === "function" ? config() : (config ?? {});
}

/**
 * 合并并构建标准的分享数据载体。
 */
function buildPayload(base: ShareConfigResolver, extra?: ShareConfigResolver): ShareConfig {
    const current = {
        ...resolveConfig(base),
        ...resolveConfig(extra),
    };
    const payload: ShareConfig = {};
    if (current.title) payload.title = current.title;
    if (current.path) payload.path = current.path;
    if (current.imageUrl) payload.imageUrl = current.imageUrl;
    return payload;
}

/**
 * 显示分享单
 */
function showShareMenu(): void {
    uni.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"],
        fail: () => undefined,
    });
}

/**
 * 小程序页面分享 Hook。
 * 自动调用并监听当前页面的 `onShareAppMessage` 与 `onShareTimeline` 原生事件。
 * 
 * @param config 默认的分享配置或配置函数
 * @returns 包含手动触发或配置的方法句柄
 * 
 * @example
 * ```ts
 * useShare({
 *   title: '欢迎体验我的小程序',
 *   path: '/pages/index/index'
 * });
 * ```
 */
export function useShare(config: ShareConfigResolver = {}): ShareHandlers {
    let appMessageRegistered = false;
    let timelineRegistered = false;

    const onShareAppMessage = (extra?: ShareConfigResolver) => {
        if (appMessageRegistered) return;
        appMessageRegistered = true;
        showShareMenu();
        registerShareAppMessage(() => buildPayload(config, extra));
    };

    const onShareTimeline = (extra?: ShareConfigResolver) => {
        if (timelineRegistered) return;
        timelineRegistered = true;
        showShareMenu();
        registerShareTimeline(() => {
            const payload = buildPayload(config, extra);
            return {
                title: payload.title,
                query: payload.path?.split("?")[1],
                imageUrl: payload.imageUrl,
            };
        });
    };

    // 默认在 setup 阶段触发注册
    onShareAppMessage();
    onShareTimeline();

    return {
        onShareAppMessage,
        onShareTimeline,
        showShareMenu,
    };
}
