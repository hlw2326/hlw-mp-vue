/**
 * 设备信息定义
 */
export interface DeviceInfo {
	appid: string
	appName: string
	version: string
	versionCode: string
	channel: string
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
