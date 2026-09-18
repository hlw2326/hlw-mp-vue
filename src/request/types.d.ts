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
	getDevice?: () => Record<string, unknown>
	/**
	 * 鉴权失败调
	 */
	onUnauthorized?: (message: string) => void
}

export type AxiosRequestConfig = RequestConfig
