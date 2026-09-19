import type { DeviceInfo } from '../utils/device/types'

/**
 * 请求配置项
 */
export interface RequestConfig {
	url: string
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | string
	data?: unknown
	params?: unknown
	baseURL?: string
	headers?: Record<string, string>
	timeout?: number
}

/**
 * 响应数据包
 */
export interface AxiosResponse<T = any> {
	data: T
	status: number
	statusText: string
	headers: Record<string, string>
	config: RequestConfig
}

/**
 * 拦截处理器
 */
export interface InterceptorHandler<T> {
	fulfilled?: (value: T) => T | Promise<T>
	rejected?: (error: any) => any
}

/**
 * 接口响应表
 */
export interface ApiRes<T = any> {
	/**
	 * 状态码数值
	 */
	code: number
	/**
	 * 提示文本串
	 */
	msg: string
	/**
	 * 数据业务体
	 */
	data: T
}

/**
 * 请求配置项
 */
export interface HttpOptions {
	/**
	 * 基础接口路
	 */
	baseURL?: string
	/**
	 * 超时时间数
	 */
	timeout?: number
	/**
	 * 获取凭证函
	 */
	getToken?: () => string
	/**
	 * 获取设备函
	 */
	getDevice?: () => DeviceInfo | Record<string, any>
	/**
	 * 鉴权失败调
	 */
	onUnauthorized?: (message: string) => void
}

/**
 * 基础上传凭据
 */
export interface UploadSignBase {
	type: 'local' | 'alioss' | 'qiniu'
	key: string
	url: string
	server: string
}

/**
 * 本地上传凭据
 */
export interface LocalUploadSign extends UploadSignBase {
	type: 'local'
}

/**
 * 阿里存储凭据
 */
export interface AliossUploadSign extends UploadSignBase {
	type: 'alioss'
	OSSAccessKeyId: string
	policy: string
	Signature: string
	success_action_status: string
}

/**
 * 七牛存储凭据
 */
export interface QiniuUploadSign extends UploadSignBase {
	type: 'qiniu'
	token: string
}

/**
 * 联合存储凭据
 */
export type UploadSign = LocalUploadSign | AliossUploadSign | QiniuUploadSign

/**
 * 文件上传参数
 */
export interface UploadFileParams {
	/** 业务场景识 */
	biz: string
	/** 本地文件径 */
	filePath: string
	/** 文件格式缀 */
	ext?: string
	/** 文件字节量 */
	size?: number
	/** 签名接口路 */
	signUrl?: string
	/** 自定义请求 */
	header?: Record<string, string>
}

/**
 * 阿里配置项
 */
export interface OssConfig {
	/** 对象存储键 */
	key?: string
	/** 上传策略串 */
	policy?: string
	/** 身份标识符 */
	OSSAccessKeyId?: string
	/** 签名密文字 */
	signature?: string
	/** 主机服务址 */
	host?: string
	/** 文件访问址 */

	url?: string
	/** 目标文件名 */
	filename?: string
	[key: string]: unknown
}
