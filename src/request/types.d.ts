import type { AxiosRequestConfig } from '@hlw-mp/core'

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
	/**
	 * 附加信息串
	 */
	info?: string
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
	getDevice?: () => Record<string, unknown>
	/**
	 * 鉴权失败调
	 */
	onUnauthorized?: (message: string) => void
}

export type ApiResponse<T = any> = ApiRes<T>;
