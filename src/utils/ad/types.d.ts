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
