import { getDevice } from '../utils/device';
import { post, getHttpOptions } from './index';
import type {
    ApiRes,
    UploadSignBase,
    LocalUploadSign,
    AliossUploadSign,
    QiniuUploadSign,
    UploadSign,
    UploadFileParams,
} from './types';

export type {
    ApiRes,
    UploadSignBase,
    LocalUploadSign,
    AliossUploadSign,
    QiniuUploadSign,
    UploadSign,
    UploadFileParams,
};

/**
 * 解析文件后缀
 * @param filePath 本地文件路径
 * @returns 文件后缀名
 */
function getFileExt(filePath: string): string {
    const ext = filePath.split('?')[0].split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mp3', 'gif'].includes(ext) ? ext : 'jpg';
}

/**
 * 组装表单数据
 * @param cred 上传签名凭据
 * @returns 表单键值对
 */
function buildFormData(cred: UploadSign): Record<string, string> {
    if (cred.type === 'local') {
        return { key: cred.key };
    }
    if (cred.type === 'alioss') {
        return {
            key: cred.key,
            policy: cred.policy,
            OSSAccessKeyId: cred.OSSAccessKeyId,
            Signature: cred.Signature,
            success_action_status: cred.success_action_status,
        };
    }
    return {
        key: cred.key,
        token: cred.token,
    };
}

/**
 * 解码响应内容
 * @param value 原始文本串
 * @returns 解码后文本
 */
function decodeUtf8(value: string): string {
    if (!value) return value;
    try {
        return decodeURIComponent(escape(value));
    } catch {
        return value;
    }
}

/**
 * 构建请求头部
 * @param cred 上传签名凭据
 * @param customHeader 额外请求头
 * @returns 请求头字典
 */
function buildHeader(cred: UploadSign, customHeader?: Record<string, string>): Record<string, string> | undefined {
    if (cred.type !== 'local' && !customHeader) {
        return undefined;
    }
    const opts = getHttpOptions();
    const devInfo = opts.getDevice ? opts.getDevice() : getDevice();
    const token = opts.getToken ? opts.getToken() : useUserStore().token;
    const appid = (devInfo as any)?.appid || '';

    const headers: Record<string, string> = { ...customHeader };
    if (cred.type === 'local') {
        if (appid) headers['X-Appid'] = String(appid);
        if (token) headers['X-Token'] = String(token);
    }
    return headers;
}

/**
 * 请求上传凭证
 * @param data 签名请求参
 * @param signUrl 签名接口址
 * @returns 上传签名据
 */
export function postUploadSign(
    data: { biz: string; ext: string; size?: number },
    signUrl = '/api/v1.upload/sign'
): Promise<ApiRes<UploadSign>> {
    return post<UploadSign>(signUrl, data);
}

/**
 * 执行文件直传
 * @param cred 上传签名凭据
 * @param filePath 本地文件径
 * @param customHeader 额外请求头
 * @returns 直传异步项
 */
export function doUpload(cred: UploadSign, filePath: string, customHeader?: Record<string, string>): Promise<void> {
    return new Promise((resolve, reject) => {
        uni.uploadFile({
            url: cred.server,
            filePath,
            name: 'file',
            formData: buildFormData(cred),
            header: buildHeader(cred, customHeader),
            success: (res: any) => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    reject(new Error(`上传失败 (${res.statusCode})`));
                    return;
                }
                if (cred.type !== 'local') {
                    resolve();
                    return;
                }
                try {
                    const body = JSON.parse(decodeUtf8(res.data));
                    body.code === 1 ? resolve() : reject(new Error(body.msg || '上传失败'));
                } catch {
                    reject(new Error('响应解析失败'));
                }
            },
            fail: (error: any) => reject(new Error(error?.errMsg || '上传失败')),
        });
    });
}

/**
 * 统一直传文件
 * @param params 文件上传参
 * @returns 文件网络址
 */
export async function uploadFile(params: UploadFileParams): Promise<string> {
    const ext = params.ext || getFileExt(params.filePath);
    const signUrl = params.signUrl || '/api/v1.upload/sign';
    const signRes = await postUploadSign({ biz: params.biz, ext, size: params.size }, signUrl);
    if (signRes.code !== 1 || !signRes.data) {
        throw new Error(signRes.msg || '获取上传凭证失败');
    }

    const cred = signRes.data;
    await doUpload(cred, params.filePath, params.header);
    return cred.url;
}
