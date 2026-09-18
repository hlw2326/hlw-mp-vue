/**
 * 设备信息结构
 */
export interface DeviceInfo {
	appid: string
	appName: string
	version: string
	versionCode: string
	channel: string
	deviceBrand: string
	deviceModel: string
	deviceId: string
	deviceType: string
	deviceOrientation: 'portrait' | 'landscape'
	brand: string
	model: string
	system: string
	os: string
	pixelRatio: number
	screenWidth: number
	screenHeight: number
	windowWidth: number
	windowHeight: number
	statusBarHeight: number
	sdkVersion: string
	hostName: string
	hostVersion: string
	hostLanguage: string
	hostTheme: string
	platform: string
	language: string
}

let deviceCache: DeviceInfo | null = null

/**
 * 采集设备信
 * @returns 设备参数集
 */
export function getDevice(): DeviceInfo {
	if (deviceCache) return deviceCache
	const deviceRaw = uni.getDeviceInfo()
	const windowRaw = uni.getWindowInfo()
	const appRaw = uni.getAppBaseInfo()
	const system = deviceRaw.system || ''

	deviceCache = {
		appid: uni.getAccountInfoSync().miniProgram.appId,
		appName: appRaw.appName || '',
		version: appRaw.appVersion || '',
		versionCode: appRaw.appVersionCode || '',
		channel: (appRaw as any).appChannel || '',
		deviceBrand: deviceRaw.brand || '',
		deviceModel: deviceRaw.model || '',
		deviceId: deviceRaw.deviceId || '',
		deviceType: deviceRaw.deviceType || '',
		deviceOrientation: ((windowRaw as any).deviceOrientation as 'portrait' | 'landscape') || 'portrait',
		brand: deviceRaw.brand || '',
		model: deviceRaw.model || '',
		system,
		os: system.split(' ')[0] || '',
		pixelRatio: windowRaw.pixelRatio || 0,
		screenWidth: windowRaw.screenWidth || 0,
		screenHeight: windowRaw.screenHeight || 0,
		windowWidth: windowRaw.windowWidth || 0,
		windowHeight: windowRaw.windowHeight || 0,
		statusBarHeight: windowRaw.statusBarHeight || 0,
		sdkVersion: appRaw.SDKVersion || '',
		hostName: appRaw.hostName || '',
		hostVersion: appRaw.hostVersion || '',
		hostLanguage: appRaw.hostLanguage || '',
		hostTheme: appRaw.hostTheme || '',
		platform: deviceRaw.platform || '',
		language: appRaw.language || ''
	}
	return deviceCache
}

/**
 * 清理设备缓
 */
export function clearDeviceCache(): void {
	deviceCache = null
}

/**
 * 设备门面对
 */
export const device = {
	get info(): DeviceInfo {
		return getDevice()
	},
	get appid(): string {
		return getDevice().appid
	},
	clearCache: clearDeviceCache
}
