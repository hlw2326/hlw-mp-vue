import type { useMsg } from "./composables/msg";
import type {
    showPopupAd,
    showRewardAd,
    playRewardAd,
} from "./utils/ad";

/**
 * 广告门面型
 */
export interface HlwAdInstance {
    /** 展示插屏广告 */
    showPopup: typeof showPopupAd;
    /** 播放激励广告 */
    showReward: typeof showRewardAd;
    /** 播放激励流程 */
    playReward: typeof playRewardAd;
}

/**
 * 全局实例型
 */
export interface HlwInstance {
    /** 统一提示管理 */
    $msg: ReturnType<typeof useMsg>;
    /** 统一广告管理 */
    $ad: HlwAdInstance;
}
