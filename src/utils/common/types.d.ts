/**
 * 文件下载选
 */
export interface DownloadOpt {
    /** 文件网络链 */
    url: string;
    /** 本地保存径 */
    path?: string;
    /** 自定义请求头 */
    header?: Record<string, string>;
    /** 进度回调函 */
    progress?: (value: number, done: number, total: number) => void;
}

/**
 * 文件下载结
 */
export interface DownloadRes {
    /** 是否已成功 */
    ok: boolean;
    /** 本地文件径 */
    path?: string;
    /** 响应状态码 */
    code?: number;
    /** 错误提示文 */
    msg?: string;
}
