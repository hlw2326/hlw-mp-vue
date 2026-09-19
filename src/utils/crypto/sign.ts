import CryptoJS from 'crypto-js'

/**
 * SHA-256 哈希计算 (基于 crypto-js)
 */
export function sha256(rawInput: string): string {
	return CryptoJS.SHA256(rawInput).toString()
}

/**
 * 递归规范化参数排序串（与后端 1:1 对齐）
 */
export function sortString(data: any): string {
	if (data === null || data === undefined || data === '') return ''
	if (typeof data === 'boolean') return data ? 'true' : 'false'
	if (typeof data !== 'object') return String(data)

	if (Array.isArray(data)) {
		return '[' + data.map((item) => sortString(item)).join(',') + ']'
	}

	const keys = Object.keys(data).sort()
	const parts: string[] = []
	for (const key of keys) {
		const val = data[key]
		if (val !== null && val !== undefined) {
			parts.push(`${key}=${sortString(val)}`)
		}
	}
	return parts.join('&')
}

export interface SignOptions {
	timestamp: string | number
	nonce: string
	context: string
	secret?: string
	data?: any
}

/**
 * 计算请求防篡改签名
 */
export function calculateSign(options: SignOptions): string {
	const ts = String(options.timestamp)
	const nonce = options.nonce
	const context = options.context
	const secret = options.secret || ''
	const dataStr = sortString(options.data)

	const raw = `ts=${ts}&nonce=${nonce}&context=${context}&data=${dataStr}&key=${secret}`
	return sha256(raw)
}
