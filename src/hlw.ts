import { useMsg } from "./composables/msg";
import {
    showPopupAd,
    showRewardAd,
    playRewardAd,
} from "./utils/ad";
import type { HlwInstance } from "./types";

let _msg: ReturnType<typeof useMsg> | null = null;

/**
 * 全局单例对象
 */
export const hlw: HlwInstance = {
    /** 延迟创建提示 */
    get $msg() { return (_msg ??= useMsg()); },
    /** 全局广告门面 */
    $ad: {
        showPopup: showPopupAd,
        showReward: showRewardAd,
        playReward: playRewardAd,
    },
};
