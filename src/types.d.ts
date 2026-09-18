import type { useMsg } from "./composables/msg";
import type {
    showPopupAd,
    showRewardAd,
    playRewardAd,
    getAdUnitId,
    setupAd,
} from "./utils/ad";

/**
 * 广告门面型
 */
export interface HlwAdInstance {
    /** 展示插屏广 */
    showPopup: typeof showPopupAd;
    /** 播放激励广 */
    showReward: typeof showRewardAd;
    /** 播放激励流 */
    playReward: typeof playRewardAd;
    /** 获取单元号 */
    getUnitId: typeof getAdUnitId;
    /** 注入广告源 */
    setup: typeof setupAd;
}

/**
 * 全局实例型
 */
export interface HlwInstance {
    /** 统一提示管 */
    $msg: ReturnType<typeof useMsg>;
    /** 统一广告管 */
    $ad: HlwAdInstance;
}
