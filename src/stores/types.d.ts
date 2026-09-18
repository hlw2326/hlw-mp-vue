/**
 * 字体大小项
 */
export interface FontSizePreset {
    id: string;
    name: string;
    class: string;
}

/**
 * 字体样式项
 */
export interface FontFamilyPreset {
    id: string;
    name: string;
    class: string;
}

/**
 * 用户资料项
 */
export interface UserProfile {
    id?: number | string;
    nickname?: string;
    avatarUrl?: string;
    phone?: string;
    gender?: number;
    openid?: string;
    vipTime?: number;
    vipNoAd?: number;
    score?: number;
    [key: string]: unknown;
}
