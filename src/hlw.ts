import { useMsg } from "./core/msg";
import {
    showPopupAd,
    showRewardAd,
    playRewardAd,
    getAdUnitId,
    setupAd,
} from "./utils/ad";

/**
 * 广告门面定义
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
 * 全局实例定义
 */
export interface HlwInstance {
    /** 统一提示管 */
    $msg: ReturnType<typeof useMsg>;
    /** 统一广告管 */
    $ad: HlwAdInstance;
}

let _msg: ReturnType<typeof useMsg> | null = null;

/**
 * 全局单例对象
 */
export const hlw: HlwInstance = {
    /** 延迟创建提 */
    get $msg() { return (_msg ??= useMsg()); },
    /** 全局广告门 */
    $ad: {
        showPopup: showPopupAd,
        showReward: showRewardAd,
        playReward: playRewardAd,
        getUnitId: getAdUnitId,
        setup: setupAd,
    },
};

