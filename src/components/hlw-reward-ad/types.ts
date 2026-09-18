/**
 * 激励广告果
 */
export interface HlwRewardAdResult {
    /** 是否播放完 */
    success: boolean;
    /** 广告是否完 */
    isEnded: boolean;
    /** 加载失败否 */
    loadFailed?: boolean;
    /** 错误信息象 */
    error?: any;
}
