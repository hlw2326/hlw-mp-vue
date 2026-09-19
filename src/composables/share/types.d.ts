/**
 * 分享卡片项
 */
export interface ShareConfig {
    /** 分享标题文 */
    title?: string;
    /** 分享页面径 */
    path?: string;
    /** 分享卡片图 */
    imageUrl?: string;
}

/**
 * 分享操作柄
 */
export interface ShareHandlers {
    /** 显分享菜单 */
    showShareMenu: () => void;
}

