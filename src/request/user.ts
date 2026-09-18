/**
 * 用户服务类
 */
export class ApiUser {
	/**
	 * 获取凭证字
	 * @returns 登录凭证
	 */
	token(): string {
		return uni.getStorageSync('token') || ''
	}

	/**
	 * 获取用户资
	 * @returns 用户信息
	 */
	info(): Record<string, unknown> {
		return uni.getStorageSync('userInfo') || {}
	}
}

/**
 * 用户门面对
 */
export const user = new ApiUser()
