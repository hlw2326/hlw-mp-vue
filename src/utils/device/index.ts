import type { DeviceInfo } from './types'

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
