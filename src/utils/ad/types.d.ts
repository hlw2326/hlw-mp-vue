/**
 * 广告配置表
 */
export interface AdConfig {
    adGlobalEnabled?: number | boolean;
    adEnabledBanner?: number | boolean;
    adEnabledGrid?: number | boolean;
    adEnabledCustom?: number | boolean;
    adEnabledVideo?: number | boolean;
    adEnabledReward?: number | boolean;
    adEnabledPopup?: number | boolean;
    bannerUnitId?: string;
    gridUnitId?: string;
    customUnitId?: string;
    videoUnitId?: string;
    rewardUnitId?: string;
    popupUnitId?: string;
    vipNoAd?: number | boolean;
    [key: string]: any;
}

/**
 * 广告配置源
 */
export type AdConfigProvider = () => AdConfig;

/**
 * 广告结果项
 */
export interface AdRes {
    /** 是否已成功 */
    success: boolean;
    /** 是否已播完 */
    isEnded: boolean;
    /** 异常错误体 */
    error?: any;
}
