import { device, app, type DeviceInfo } from '@hlw-mp/core'

/**
 * 读取应用号
 * @returns 目标应用号
 */
function getAppid(): string {
	const current = app.getCurrentInfo?.()
	if (current?.appid && current.appid !== 'container') {
		return current.appid
	}
	return (typeof globalThis !== 'undefined' && (globalThis as any).__APPID__) || ''
}

/**
 * 读取应用名
 * @returns 目标应用名
 */
function getName(): string {
	const current = app.getCurrentInfo?.()
	if (current?.name) {
		return current.name
	}
	return (typeof globalThis !== 'undefined' && (globalThis as any).__APP_NAME__) || ''
}

/**
 * 读取版本码
 * @returns 版本数字码
 */
function getCode(): number {
	const current = app.getCurrentInfo?.() as any
	if (current?.versionCode) {
		return typeof current.versionCode === 'number' ? current.versionCode : parseInt(current.versionCode, 10) || 1
	}
	return (typeof globalThis !== 'undefined' && (globalThis as any).__APP_VERSION_CODE__) || 1
}

/**
 * 读取版本号
 * @returns 版本名称串
 */
function getVersion(): string {
	const current = app.getCurrentInfo?.()
	if (current?.version) {
		return current.version
	}
	return (typeof globalThis !== 'undefined' && (globalThis as any).__APP_VERSION_NAME__) || '1.0.0'
}

/**
 * 读取设备号
 * @returns 设备参数集
 */
export function getDevice(): Record<string, unknown> {
	const info: DeviceInfo = device.info

	return {
		appid: getAppid() || info.appid,
		app_name: getName() || info.app_name,
		version: getVersion() || info.version,
		version_code: getCode(),
		channel: info.channel,
		device_id: info.device_id,
		device_brand: info.device_brand,
		device_model: info.device_model,
		device_type: info.device_type,
		device_orientation: info.device_orientation,
		device_system: info.system,
		platform: info.platform,
		system: info.system,
		os: info.os,
		screen_width: info.screen_width,
		screen_height: info.screen_height,
		pixel_ratio: info.pixel_ratio,
		status_bar_height: info.status_bar_height,
		sdk_version: info.sdk_version,
		host_name: info.host_name,
		host_version: info.host_version,
		host_language: info.host_language,
		language: info.language
	}
}
