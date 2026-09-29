export interface AdUnitConfig {
    enabled?: boolean;
    unitId?: string;
}

/**
 * 广告配置表
 */
export interface AdConfig {
    enabled?: boolean;
    banner?: AdUnitConfig;
    grid?: AdUnitConfig;
    custom?: AdUnitConfig;
    video?: AdUnitConfig;
    reward?: AdUnitConfig;
    popup?: AdUnitConfig;
    vipNoAd?: boolean;
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
