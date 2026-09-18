/**
 * 小程序通用工具。
 * 包含查询字符串参数拼接、数据转换、剪贴板交互、授权及图片/视频等多媒体资源下载保存。
 */

import { hlw } from "../../hlw";

/**
 * 文件下载选项配置接口。
 */
export interface DownloadOpt {
    /** 文件的网络下载链接 */
    url: string;
    /** 指定文件保存的本地目标路径，可选 */
    path?: string;
    /** 请求的自定义 HTTP 请求头 */
    header?: Record<string, string>;
    /** 下载进度更新的回调函数 */
    progress?: (value: number, done: number, total: number) => void;
}

/**
 * 文件下载结果接口。
 */
export interface DownloadRes {
    /** 是否成功下载 */
    ok: boolean;
    /** 临时或保存后的本地文件路径 */
    path?: string;
    /** 服务器返回的 HTTP 状态码 */
    code?: number;
    /** 错误或提示信息 */
    msg?: string;
}

/**
 * 拼接 URL 与 Query String。
 * 会根据原 URL 中是否包含问号，自动拼接 `?` 或 `&`。
 * @param url 原 URL
 * @param qs 格式化后的 query 字符串（如 'a=1&b=2'）
 * @returns 拼接后的完整 URL
 */
export function withQuery(url: string, qs: string): string {
    if (!qs) return url;
    return `${url}${url.includes("?") ? "&" : "?"}${qs}`;
}

/**
 * 将键值对对象转换为 URL 编码 of Query String。
 * 会自动过滤值为 `undefined` 或 `null` 的键。
 * @param data 需要转换的键值对数据对象
 * @returns 格式化后的 Query String 字符串
 */
export function toQuery(data: Record<string, unknown>): string {
    return Object.entries(data)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join("&");
}

/**
 * 按照特定规则对 URL 或者是 Query 参数进行排序并构造签名文本。
 * 常用于 API 请求签名的加密前置数据处理。
 * @param url 需要签名的完整 URL 或路径
 * @returns 排序拼接后的签名基准字符串
 */
export function signText(url: string): string {
    const [path, qs] = url.split("?");
    return qs ? `${qs.split("&").filter(Boolean).sort().join("&")}&` : `${path}&`;
}

/**
 * 安全转换未知值到数字类型，若转换失败则返回默认值。
 * @param value 待转换的值
 * @param defaultValue 默认数字
 * @returns 转换后的数字或默认值
 */
export function toNumber(value: unknown, defaultValue: number): number {
    const next = Number(value);
    return Number.isFinite(next) ? next : defaultValue;
}

/**
 * 安全转换未知值到布尔值类型，若转换失败则返回默认值。
 * 兼容特殊数值（如 0, "0", "false" 视为 false；1, "1", "true" 视为 true）。
 * @param value 待转换的值
 * @param defaultValue 默认布尔值
 * @returns 转换后的布尔值或默认值
 */
export function toBoolean(value: unknown, defaultValue: boolean): boolean {
    if (typeof value === "boolean") return value;
    if (value === 0 || value === "0" || value === "false") return false;
    if (value === 1 || value === "1" || value === "true") return true;
    return defaultValue;
}

/**
 * 复制文本内容至剪贴板。
 * @param text 需要复制的文本
 * @param tip 是否在成功时显示 "复制成功" 的 Toast 提示，默认 true
 * @returns 是否复制成功
 */
export function copy(text: string, tip = true): Promise<boolean> {
    return new Promise((resolve) => {
        uni.setClipboardData({
            data: text,
            showToast: false,
            success: () => {
                if (tip) {
                    hlw.$msg.toast("复制成功");
                }
                resolve(true);
            },
            fail: () => resolve(false),
        });
    });
}

/**
 * 从系统剪贴板中读取文本内容。
 * @returns 剪贴板文本，若读取失败或无内容返回空字符串
 */
export function paste(): Promise<string> {
    return new Promise((resolve) => {
        uni.getClipboardData({
            success: (res) => resolve(res.data),
            fail: () => resolve(""),
        });
    });
}

/**
 * 引导用户进行系统相册权限授权提示弹窗。
 */
export function auth(): void {
    uni.showModal({
        title: "提示",
        content: "需要授权相册权限",
        confirmText: "去设置",
        success: (res) => {
            if (res.confirm) uni.openSetting();
        },
    });
}

/**
 * 保存本地临时图片文件到系统相册中。
 * 若无权限会自动调起 `auth()` 引导用户去设置页开启权限。
 * @param path 本地临时图片路径 (如 wxfile://xxx, http://tmp/xxx)
 * @returns 保存是否成功
 */
export function saveImage(path: string): Promise<boolean> {
    return new Promise((resolve) => {
        uni.saveImageToPhotosAlbum({
            filePath: path,
            success: () => {
                hlw.$msg.success("保存成功");
                resolve(true);
            },
            fail: (error) => {
                const msg = String(error.errMsg || "");
                if (msg.includes("auth deny") || msg.includes("authorize")) {
                    auth();
                } else {
                    hlw.$msg.toast("保存失败");
                }
                resolve(false);
            },
        });
    });
}

/**
 * 保存本地临时视频文件到系统相册中。
 * 若无权限会自动引导授权。
 * @param path 本地临时视频路径
 * @returns 保存是否成功
 */
export function saveVideoFile(path: string): Promise<boolean> {
    return new Promise((resolve) => {
        uni.saveVideoToPhotosAlbum({
            filePath: path,
            success: () => {
                hlw.$msg.success("保存成功");
                resolve(true);
            },
            fail: (error) => {
                const msg = String(error.errMsg || "");
                if (msg.includes("auth deny") || msg.includes("authorize")) {
                    auth();
                } else {
                    hlw.$msg.toast("保存失败");
                }
                resolve(false);
            },
        });
    });
}

/**
 * 基于 UniApp 下载网络资源至本地临时目录中。
 * @param opt 下载参数配置项
 * @returns 下载结果 Promise
 */
export function download(opt: DownloadOpt): Promise<DownloadRes> {
    return new Promise((resolve) => {
        const task = uni.downloadFile({
            url: opt.url,
            filePath: opt.path,
            header: opt.header,
            success: (res) => {
                if (res.statusCode === 200) {
                    resolve({ ok: true, path: res.tempFilePath, code: res.statusCode });
                } else {
                    resolve({ ok: false, code: res.statusCode, msg: `下载失败，状态码：${res.statusCode}` });
                }
            },
            fail: (error) => resolve({ ok: false, msg: error.errMsg }),
        });

        if (opt.progress) {
            task.onProgressUpdate((res) => {
                opt.progress!(res.progress, res.totalBytesWritten, res.totalBytesExpectedToWrite);
            });
        }
    });
}

/**
 * 下载并保存网络图片至系统相册。
 * 过程中包含 Loading 提示以及权限处理。
 * @param url 网络图片地址
 * @param progress 可选的下载进度更新回调
 * @returns 操作是否成功
 */
export async function saveImageUrl(url: string, progress?: (value: number) => void): Promise<boolean> {
    try {
        hlw.$msg.showLoading("下载中...");
        const res = await download({ url, progress: progress ? (value) => progress(value) : undefined });
        hlw.$msg.hideLoading();

        if (!res.ok || !res.path) {
            hlw.$msg.toast(res.msg || "下载失败");
            return false;
        }

        return await saveImage(res.path);
    } catch {
        hlw.$msg.hideLoading();
        hlw.$msg.toast("操作失败");
        return false;
    }
}

/**
 * 下载并保存网络视频至系统相册。
 * 过程中包含 Loading 提示以及权限处理。
 * @param url 网络视频地址
 * @param progress 可选的下载进度更新回调
 * @returns 操作是否成功
 */
export async function saveVideoUrl(url: string, progress?: (value: number) => void): Promise<boolean> {
    try {
        hlw.$msg.showLoading("下载中...");
        const res = await download({ url, progress: progress ? (value) => progress(value) : undefined });
        hlw.$msg.hideLoading();

        if (!res.ok || !res.path) {
            hlw.$msg.toast(res.msg || "下载失败");
            return false;
        }

        return await saveVideoFile(res.path);
    } catch {
        hlw.$msg.hideLoading();
        hlw.$msg.toast("操作失败");
        return false;
    }
}

/**
 * 从格式化的字符串中解析出数字类型（如去除千分位逗号等）。
 * @param valueString 待解析的字符串
 * @returns 解析出的数字
 */
export function getNumber(valueString: string): number {
    return parseFloat((valueString || "").replace(/,/g, "")) || 0;
}

/**
 * 格式化大数值，如 12345 转换为 1.2w。
 * @param value 待转换的值（数值或字符串）
 * @returns 格式化后的字符串
 */
export function formatConvertNumber(value: number | string): string {
    const num = parseFloat(String(value)) || 0;
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + "w";
    }
    return String(value);
}

/**
 * 兼容性的 requestAnimationFrame 封装，支持小程序与 H5 环境。
 * @param callback 回调函数
 */
export function requestAnimFrame(callback: () => void): void {
    if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(callback);
    } else {
        setTimeout(callback, 16);
    }
}

/**
 * 检查新版本
 * @param title 提示标题串
 * @param content 提示内容串
 */
export function checkAppUpdate(title = "更新提示", content = "新版本已经准备好，是否重启应用？"): void {
    const updateManager = uni.getUpdateManager();
    updateManager.onUpdateReady(() => {
        uni.showModal({
            title,
            content,
            showCancel: false,
            confirmText: "立即重启",
            success: (res: any) => {
                if (res?.confirm) {
                    updateManager.applyUpdate();
                }
            },
        });
    });
}

