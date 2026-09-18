import { http, user, type AxiosInstance, type AxiosRequestConfig } from '@hlw-mp/core'
import { getDevice } from './device'
import type { ApiRes, HttpOptions } from './types'

let target: AxiosInstance | null = null
let currentOptions: HttpOptions = {}
let lastToastTime = 0

/**
 * 提示消息
 * @param message 错误提示文
 */
function toast(message: string): void {
	uni.showToast({ title: message, icon: 'none' })
}

/**
 * 处理未授权
 * @param message 错误提示文
 * @param callback 异常回调函
 */
function handleUnauthorized(message: string, callback?: (msg: string) => void): void {
	const now = Date.now()
	if (now - lastToastTime > 3000) {
		lastToastTime = now
		toast(message)
	}
	if (callback) {
		callback(message)
	}
}

/**
 * 配置网络请
 * @param options 网络配置项
 * @returns 请求实例项
 */
export function setupHttp(options: Partial<HttpOptions> = {}): AxiosInstance {
	currentOptions = { ...currentOptions, ...options }
	if (target && options.baseURL) {
		target.defaults.baseURL = options.baseURL
	}
	return getClient()
}

/**
 * 获取请求例
 * @returns 请求实例项
 */
export function getClient(): AxiosInstance {
	if (target) {
		if (currentOptions.baseURL && !target.defaults.baseURL) {
			target.defaults.baseURL = currentOptions.baseURL
		}
		return target
	}

	const base =
		currentOptions.baseURL ||
		(globalThis as any).__APP_BASE_URL__ ||
		''

	const inst: AxiosInstance = (http as any).create({
		baseURL: base,
		timeout: currentOptions.timeout || 15000,
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		}
	})

	// 请求发送拦截
	inst.interceptors.request.use(
		async (config: any) => {
			const devInfo = currentOptions.getDevice ? currentOptions.getDevice() : getDevice()
			const token = currentOptions.getToken ? currentOptions.getToken() : user.token()
			const time = Date.now()
			const nonce = Math.random().toString(36).substring(2, 12)
			const cipher = encodeURIComponent(
				JSON.stringify({
					...devInfo,
					token
				})
			)

			if (!config.headers) {
				config.headers = {}
			}
			config.headers['X-Client-Timestamp'] = String(time)
			config.headers['X-Client-Nonce'] = nonce
			config.headers['X-Client-Sign'] = ''
			config.headers['X-Client-Context'] = cipher
			if ((devInfo as any)?.appid) {
				config.headers['x-appid'] = (devInfo as any).appid
			}
			if (token) {
				config.headers['api-token'] = token
				config.headers['x-token'] = token
			}
			return config
		},
		(error: any) => {
			return Promise.reject(error)
		}
	)

	// 响应结果拦截
	inst.interceptors.response.use(
		async (response: any) => {
			const res = response.data
			if (res && (res.code === 401 || res.code === 403)) {
				const message = res.msg || '登录已失效，请重新登录'
				handleUnauthorized(message, currentOptions.onUnauthorized)
			}
			return response
		},
		(error: any) => {
			const status = error.response?.status || error.status || error.statusCode
			const message = error.response?.data?.msg || error.message || '网络连接异常'
			if (status === 401 || status === 403) {
				handleUnauthorized(message, currentOptions.onUnauthorized)
			}
			return Promise.reject(error)
		}
	)

	target = inst
	return inst
}

/**
 * 发送通用请
 * @param config 请求配置项
 * @returns 异步响应体
 */
export function request<T = any>(config: AxiosRequestConfig): Promise<ApiRes<T>> {
	return getClient().request(config).then((res: any) => res.data)
}

/**
 * 发送读取请
 * @param url 接口地址串
 * @param params 查询参数体
 * @returns 异步响应体
 */
export function get<T = any>(url: string, params?: unknown): Promise<ApiRes<T>> {
	return request<T>({ url, method: 'GET', params })
}

/**
 * 发送提交请
 * @param url 接口地址串
 * @param data 提交数据体
 * @returns 异步响应体
 */
export function post<T = any>(url: string, data?: unknown): Promise<ApiRes<T>> {
	return request<T>({ url, method: 'POST', data })
}

/**
 * 发送修改请
 * @param url 接口地址串
 * @param data 修改数据体
 * @returns 异步响应体
 */
export function put<T = any>(url: string, data?: unknown): Promise<ApiRes<T>> {
	return request<T>({ url, method: 'PUT', data })
}

/**
 * 发送删除请
 * @param url 接口地址串
 * @param params 查询参数体
 * @returns 异步响应体
 */
export function del<T = any>(url: string, params?: unknown): Promise<ApiRes<T>> {
	return request<T>({ url, method: 'DELETE', params })
}

/**
 * 获取网络配置
 * @returns 全局配置项
 */
export function getHttpOptions(): HttpOptions {
	return currentOptions
}

export const client = new Proxy({} as AxiosInstance, {
	get(target, prop) {
		const inst = getClient()
		const targetValue = (inst as any)[prop]
		return typeof targetValue === 'function' ? targetValue.bind(inst) : targetValue
	}
})

export * from './device'
export * from './oss'
export * from './types'
export * from './upload'

