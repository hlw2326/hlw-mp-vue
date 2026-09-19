import {
    onShareAppMessage as registerShareAppMessage,
    onShareTimeline as registerShareTimeline,
} from "@dcloudio/uni-app";
import type { ShareConfig, ShareHandlers } from "./types";

export type { ShareConfig, ShareHandlers };

/**
 * 显示分享单
 */
function showShareMenu(): void {
    uni.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"],
    });
}

/**
 * 分享组合钩
 */
export function useShare(config: ShareConfig = {}): ShareHandlers {
    let appMessageRegistered = false;
    let timelineRegistered = false;

    const onShareAppMessage = (extra?: ShareConfig) => {
        if (appMessageRegistered) return;
        appMessageRegistered = true;
        showShareMenu();
        registerShareAppMessage(() => ({ ...config, ...extra }));
    };

    const onShareTimeline = (extra?: ShareConfig) => {
        if (timelineRegistered) return;
        timelineRegistered = true;
        showShareMenu();
        registerShareTimeline(() => {
            const payload = { ...config, ...extra };
            return {
                title: payload.title,
                query: payload.path?.split("?")[1],
                imageUrl: payload.imageUrl,
            };
        });
    };

    onShareAppMessage();
    onShareTimeline();

    return {
        onShareAppMessage,
        onShareTimeline,
        showShareMenu,
    };
}

