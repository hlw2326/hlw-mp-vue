import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
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
    showShareMenu();

    onShareAppMessage(() => ({ ...config }));

    onShareTimeline(() => {
        return {
            title: config.title,
            query: config.path?.split("?")[1],
            imageUrl: config.imageUrl,
        };
    });

    return {
        showShareMenu,
    };
}

