import { user } from '@hlw-mp/core'
import { getDevice } from './device'
import type { ApiRes, HttpOptions, RequestConfig, AxiosResponse, InterceptorHandler } from './types'

/**
 * 拦截管理器
 */
export class InterceptorManager<T> {
	private handlers: (InterceptorHandler<T> | null)[] = []

	use(fulfilled?: (value: T) => T | Promise<T>, rejected?: (error: any) => any): number {
		this.handlers.push({ fulfilled, rejected })
		return this.handlers.length - 1
	}

	eject(id: number): void {
		if (this.handlers[id]) {
			this.handlers[id] = null
		}
	}

	forEach(fn: (handler: InterceptorHandler<T>) => void): void {
		for (const h of this.handlers) {
			if (h !== null) fn(h)
		}
	}
}

/**
 * 原生请求端
 */
export class UniHttpClient {
	defaults = {
		baseURL: '',
		timeout: 15000,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		} as Record<string, string>
	}

	interceptors = {
		request: new InterceptorManager<RequestConfig>(),
		response: new InterceptorManager<AxiosResponse>()
	}

	constructor(options: { baseURL?: string; timeout?: number; headers?: Record<string, string> } = {}) {
		if (options.baseURL) this.defaults.baseURL = options.baseURL.replace(/\/+$/, '')
		if (options.timeout) this.defaults.timeout = options.timeout
		if (options.headers) this.defaults.headers = { ...this.defaults.headers, ...options.headers }
	}

	async request<T = any>(config: RequestConfig): Promise<AxiosResponse<T>> {
		const cfg: RequestConfig = {
			method: 'GET',
			...config,
			baseURL: config.baseURL ?? this.defaults.baseURL,
			headers: { ...this.defaults.headers, ...config.headers },
			timeout: config.timeout ?? this.defaults.timeout
		}

		const requestChain: any[] = []
		this.interceptors.request.forEach((h) => {
			requestChain.push(h.fulfilled, h.rejected)
		})

		let promise: Promise<any> = Promise.resolve(cfg)
		while (requestChain.length) {
			promise = promise.then(requestChain.shift(), requestChain.shift())
		}

		let responsePromise = promise.then(async (finalConfig: RequestConfig) => {
			const fullUrl = this.resolveUrl(finalConfig.url, finalConfig.baseURL)
			return this.send<T>(fullUrl, finalConfig)
		})

		const responseChain: any[] = []
		this.interceptors.response.forEach((h) => {
			responseChain.push(h.fulfilled, h.rejected)
		})

		while (responseChain.length) {
			responsePromise = responsePromise.then(responseChain.shift(), responseChain.shift())
		}

		return responsePromise
	}

	get<T = any>(url: string, config?: Partial<RequestConfig>): Promise<AxiosResponse<T>> {
		return this.request<T>({ ...config, url, method: 'GET' })
	}

	post<T = any>(url: string, data?: unknown, config?: Partial<RequestConfig>): Promise<AxiosResponse<T>> {
		return this.request<T>({ ...config, url, method: 'POST', data })
	}

	put<T = any>(url: string, data?: unknown, config?: Partial<RequestConfig>): Promise<AxiosResponse<T>> {
		return this.request<T>({ ...config, url, method: 'PUT', data })
	}

	delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<AxiosResponse<T>> {
		return this.request<T>({ ...config, url, method: 'DELETE' })
	}

	private resolveUrl(url: string, baseURL?: string): string {
		if (/^(https?:)?\/\//.test(url) || url.startsWith('file://')) return url
		const base = (baseURL || this.defaults.baseURL || '').replace(/\/+$/, '')
		const path = url.startsWith('/') ? url : `/${url}`
		return base ? `${base}${path}` : path
	}

	private send<T>(url: string, cfg: RequestConfig): Promise<AxiosResponse<T>> {
		return new Promise((resolve, reject) => {
			const isGet = (cfg.method || 'GET').toUpperCase() === 'GET'
			const requestData = isGet ? (cfg.params ?? cfg.data) : (cfg.data ?? cfg.params)

			uni.request({
				url,
				method: (cfg.method?.toUpperCase() as any) || 'GET',
				data: requestData as any,
				header: cfg.headers as Record<string, string>,
				timeout: cfg.timeout,
				success: (res) => {
					const response: AxiosResponse<T> = {
						data: res.data as T,
						status: res.statusCode,
						statusText: String(res.statusCode),
						headers: (res.header || {}) as Record<string, string>,
						config: cfg
					}

					if (res.statusCode >= 200 && res.statusCode < 300) {
						resolve(response)
					} else {
						const body = res.data as Record<string, unknown> | undefined
						const error: any = new Error(String(body?.msg ?? body?.message ?? `请求失败: ${res.statusCode}`))
						error.response = response
						error.status = res.statusCode
						reject(error)
					}
				},
				fail: (errorResult) => {
					const error: any = new Error(errorResult.errMsg || '网络请求失败')
					error.config = cfg
					reject(error)
				}
			})
		})
	}
}

export type AxiosInstance = UniHttpClient

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

	const base = currentOptions.baseURL || ''
	const inst = new UniHttpClient({
		baseURL: base,
		timeout: currentOptions.timeout || 15000
	})

	// 请求发送拦截
	inst.interceptors.request.use(
		async (config: RequestConfig) => {
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

			config.headers = config.headers || {}
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
		(error: any) => Promise.reject(error)
	)

	// 响应结果拦截
	inst.interceptors.response.use(
		async (response: AxiosResponse) => {
			const res = response.data as any
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
 * 发送通用请
 * @param config 请求配置项
 * @returns 异步响应体
 */
export function request<T = any>(config: RequestConfig): Promise<ApiRes<T>> {
	return getClient()
		.request<ApiRes<T>>(config)
		.then((res) => res.data)
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
	get(_, prop) {
		const inst = getClient()
		const val = (inst as any)[prop]
		return typeof val === 'function' ? val.bind(inst) : val
	}
})

export * from './device'
export * from './oss'
export * from './types'
export * from './upload'
