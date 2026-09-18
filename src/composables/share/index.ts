import {
    onShareAppMessage as registerShareAppMessage,
    onShareTimeline as registerShareTimeline,
} from "@dcloudio/uni-app";
import type { ShareConfig, ShareConfigResolver, ShareHandlers } from "./types";

export type { ShareConfig, ShareConfigResolver, ShareHandlers };

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
