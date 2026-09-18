import { useMsg } from "./composables/msg";
import {
    showPopupAd,
    showRewardAd,
    playRewardAd,
    getAdUnitId,
    setupAd,
} from "./utils/ad";
import type { HlwAdInstance, HlwInstance } from "./types";

export type { HlwAdInstance, HlwInstance } from "./types";

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

