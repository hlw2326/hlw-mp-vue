import type { DeviceInfo } from './types'

let deviceCache: DeviceInfo | null = null
let currentNetworkType = ''

// 异步监听网络状态保持最新
try {
	if (typeof uni !== 'undefined' && uni.getNetworkType) {
		uni.getNetworkType({
			success(res) {
				currentNetworkType = res.networkType || ''
				if (deviceCache) {
					deviceCache.networkType = currentNetworkType
				}
			}
		})
		if (uni.onNetworkStatusChange) {
			uni.onNetworkStatusChange((res) => {
				currentNetworkType = res.networkType || ''
				if (deviceCache) {
					deviceCache.networkType = currentNetworkType
				}
			})
		}
	}
} catch {}

/**
 * 采集设备信息
 * @returns 设备参数集
 */
export function getDevice(): DeviceInfo {
	if (deviceCache) return deviceCache
	const deviceRaw = uni.getDeviceInfo ? uni.getDeviceInfo() : ({} as any)
	const windowRaw = uni.getWindowInfo ? uni.getWindowInfo() : ({} as any)
	const appRaw = uni.getAppBaseInfo ? uni.getAppBaseInfo() : ({} as any)
	const system = deviceRaw.system || ''

	deviceCache = {
		appid: uni.getAccountInfoSync ? uni.getAccountInfoSync().miniProgram?.appId || '' : '',
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
		hostTheme: appRaw.hostTheme || (appRaw as any).theme || '',
		platform: deviceRaw.platform || '',
		language: appRaw.language || '',
		networkType: currentNetworkType,
		benchmarkLevel: (deviceRaw as any).benchmarkLevel ?? -1,
		theme: (appRaw as any).theme || (appRaw as any).hostTheme || '',
		fontSizeSetting: (windowRaw as any).fontSizeSetting || 16
	}
	return deviceCache
}

/**
 * 清理设备缓
 */
export function clearDeviceCache(): void {
	deviceCache = null
}
