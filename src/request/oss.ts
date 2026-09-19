import type { OssConfig } from "./types";

export type { OssConfig };

/**
 * 直传阿里盘
 * @param oss 阿里配置项
 * @param source 源文件路径或文件对象
 * @returns 资源访问址
 */
export async function uploadOss(
	oss: OssConfig,
	source: string | any
): Promise<string> {
	const filePath = typeof source === 'string' ? source : (source?.path || source?.tempFilePath || '');
	const name = (oss.filename as string) || (filePath ? filePath.split('/').pop() : 'file');

	const formData: Record<string, any> = {
		key: String(oss.key || ''),
		success_action_status: '200'
	};
	if (oss.policy) formData.policy = String(oss.policy);
	if (oss.OSSAccessKeyId) formData.OSSAccessKeyId = String(oss.OSSAccessKeyId);
	if (oss.signature) formData.signature = String(oss.signature);
	if (oss['x-oss-security-token']) formData['x-oss-security-token'] = String(oss['x-oss-security-token']);

	const target = String(oss.host || '');

	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: target,
			filePath,
			name: 'file',
			formData,
			header: {
				'Content-Disposition': `inline;filename=${encodeURIComponent(name || 'file')}`
			},
			success: (res) => {
				if (res.statusCode === 200 || res.statusCode === 204) {
					resolve(String(oss.url || ''));
				} else {
					reject(new Error(`上传阿里云失败 (${res.statusCode}): ${res.data || ''}`));
				}
			},
			fail: (error) => reject(new Error(error.errMsg || '上传阿里云失败'))
		});
	});
}
