/**
 * 纯 TypeScript 实现的 RSA-2048 公钥分段加密（PKCS#1 v1.5 填充）
 * 零第三方外部依赖，原生兼容小程序、浏览器与 Node 环境
 */

function base64ToBytes(b64: string): Uint8Array {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	const str = b64.replace(/[\r\n\s=]/g, '')
	const bytes: number[] = []
	for (let i = 0; i < str.length; i += 4) {
		const b0 = chars.indexOf(str[i])
		const b1 = chars.indexOf(str[i + 1])
		const b2 = i + 2 < str.length ? chars.indexOf(str[i + 2]) : 64
		const b3 = i + 3 < str.length ? chars.indexOf(str[i + 3]) : 64

		bytes.push((b0 << 2) | (b1 >> 4))
		if (b2 !== 64 && b2 !== -1) {
			bytes.push(((b1 & 15) << 4) | (b2 >> 2))
		}
		if (b3 !== 64 && b3 !== -1) {
			bytes.push(((b2 & 3) << 6) | b3)
		}
	}
	return new Uint8Array(bytes)
}

function bytesToBase64(bytes: Uint8Array): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	let res = ''
	for (let i = 0; i < bytes.length; i += 3) {
		const b0 = bytes[i]
		const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0
		const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0

		res += chars[b0 >> 2]
		res += chars[((b0 & 3) << 4) | (b1 >> 4)]
		res += i + 1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '='
		res += i + 2 < bytes.length ? chars[b2 & 63] : '='
	}
	return res
}

function stringToUtf8(str: string): Uint8Array {
	if (typeof TextEncoder !== 'undefined') {
		return new TextEncoder().encode(str)
	}
	const code = unescape(encodeURIComponent(str))
	const bytes = new Uint8Array(code.length)
	for (let i = 0; i < code.length; i++) {
		bytes[i] = code.charCodeAt(i)
	}
	return bytes
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
	let res = 1n
	base = base % mod
	while (exp > 0n) {
		if (exp & 1n) res = (res * base) % mod
		base = (base * base) % mod
		exp >>= 1n
	}
	return res
}

function parseSpki(der: Uint8Array): { n: bigint; e: bigint; keyLen: number } {
	let offset = 0
	function readLength(): number {
		let len = der[offset++]
		if (len & 0x80) {
			const count = len & 0x7f
			len = 0
			for (let i = 0; i < count; i++) {
				len = (len << 8) | der[offset++]
			}
		}
		return len
	}

	if (der[offset++] !== 0x30) throw new Error('Invalid PEM: expected SEQUENCE')
	readLength()

	if (der[offset++] !== 0x30) throw new Error('Invalid PEM: expected AlgorithmIdentifier')
	const algLen = readLength()
	offset += algLen

	if (der[offset++] !== 0x03) throw new Error('Invalid PEM: expected BIT STRING')
	readLength()
	offset++

	if (der[offset++] !== 0x30) throw new Error('Invalid PEM: expected RSAPublicKey SEQUENCE')
	readLength()

	if (der[offset++] !== 0x02) throw new Error('Invalid PEM: expected Modulus INTEGER')
	const nLen = readLength()
	let nBytes = der.subarray(offset, offset + nLen)
	offset += nLen
	if (nBytes[0] === 0x00) {
		nBytes = nBytes.subarray(1)
	}

	if (der[offset++] !== 0x02) throw new Error('Invalid PEM: expected Exponent INTEGER')
	const eLen = readLength()
	const eBytes = der.subarray(offset, offset + eLen)

	let n = 0n
	for (const b of nBytes) n = (n << 8n) | BigInt(b)

	let e = 0n
	for (const b of eBytes) e = (e << 8n) | BigInt(b)

	return { n, e, keyLen: nBytes.length }
}

function encryptBlock(chunk: Uint8Array, n: bigint, e: bigint, keyLen: number): Uint8Array {
	const padLen = keyLen - 3 - chunk.length
	if (padLen < 8) throw new Error('Data too long for RSA key')

	const block = new Uint8Array(keyLen)
	block[0] = 0x00
	block[1] = 0x02

	for (let i = 0; i < padLen; i++) {
		let rand = 0
		while (rand === 0) {
			rand = Math.floor(Math.random() * 256)
		}
		block[2 + i] = rand
	}

	block[2 + padLen] = 0x00
	block.set(chunk, 3 + padLen)

	let m = 0n
	for (const b of block) m = (m << 8n) | BigInt(b)

	const c = modPow(m, e, n)

	const out = new Uint8Array(keyLen)
	let temp = c
	for (let i = keyLen - 1; i >= 0; i--) {
		out[i] = Number(temp & 0xffn)
		temp >>= 8n
	}
	return out
}

/**
 * RSA-2048 公钥分段加密
 * @param text 明文字符串
 * @param pem 公钥 PEM 格式文本
 * @returns 点分隔的 Base64 密文段
 */
export function encryptRsa(text: string, pem: string): string {
	if (!text || !pem) return ''

	const cleanKey = pem
		.replace(/-----BEGIN (?:RSA )?PUBLIC KEY-----/, '')
		.replace(/-----END (?:RSA )?PUBLIC KEY-----/, '')
		.replace(/[\r\n\s]/g, '')

	const der = base64ToBytes(cleanKey)
	const { n, e, keyLen } = parseSpki(der)

	const maxChunk = keyLen - 11
	const chunkSize = Math.min(maxChunk, 117)
	const data = stringToUtf8(text)
	const parts: string[] = []

	for (let i = 0; i < data.length; i += chunkSize) {
		const chunk = data.subarray(i, i + chunkSize)
		const encBytes = encryptBlock(chunk, n, e, keyLen)
		parts.push(bytesToBase64(encBytes))
	}

	return parts.join('.')
}
