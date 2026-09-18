/**
 * 小程序广告工具。
 * 提供插屏广告 (Interstitial Ad) 与激励视频广告 (Rewarded Video Ad) 的注册、缓存与展示能力。
 */

import { computed, type ComputedRef } from "vue";

declare const uni: any;

/**
 * 广告配置表
 */
export interface AdConfig {
    adGlobalEnabled?: number | boolean;
    adEnabledBanner?: number | boolean;
    adEnabledGrid?: number | boolean;
    adEnabledCustom?: number | boolean;
    adEnabledVideo?: number | boolean;
    adEnabledReward?: number | boolean;
    adEnabledPopup?: number | boolean;
    bannerUnitId?: string;
    gridUnitId?: string;
    customUnitId?: string;
    videoUnitId?: string;
    rewardUnitId?: string;
    popupUnitId?: string;
    vipNoAd?: number | boolean;
    [key: string]: any;
}

export type AdConfigProvider = () => AdConfig;

let currentAdConfigProvider: AdConfigProvider | null = null;

/**
 * 配置广告源
 * @param provider 广告配置源
 */
export function setupAd(provider: AdConfigProvider | AdConfig): void {
    if (typeof provider === "function") {
        currentAdConfigProvider = provider;
    } else {
        currentAdConfigProvider = () => provider;
    }
}

/**
 * 读取广告配
 * @returns 广告配置项
 */
export function getAdConfig(): AdConfig {
    if (currentAdConfigProvider) {
        return currentAdConfigProvider() || {};
    }
    try {
        if (typeof uni !== "undefined" && uni.getStorageSync) {
            const saved = uni.getStorageSync("config");
            if (saved?.ad) return saved.ad;
        }
    } catch {}
    return {};
}

/**
 * 解析单元号
 * @param type 广告类型值
 * @returns 广告单元码
 */
export function getAdUnitId(type: "banner" | "grid" | "custom" | "video" | "reward" | "popup" = "custom"): string {
    const config = getAdConfig();
    const isGlobalEnabled = config.adGlobalEnabled === undefined || config.adGlobalEnabled === 1 || config.adGlobalEnabled === true;
    if (!isGlobalEnabled) return "";

    switch (type) {
        case "banner": {
            const enabled = config.adEnabledBanner === undefined || config.adEnabledBanner === 1 || config.adEnabledBanner === true;
            return enabled ? (config.bannerUnitId || "") : "";
        }
        case "grid": {
            const enabled = config.adEnabledGrid === undefined || config.adEnabledGrid === 1 || config.adEnabledGrid === true;
            return enabled ? (config.gridUnitId || "") : "";
        }
        case "custom": {
            const enabled = config.adEnabledCustom === undefined || config.adEnabledCustom === 1 || config.adEnabledCustom === true;
            return enabled ? (config.customUnitId || config.bannerUnitId || "") : "";
        }
        case "reward": {
            const enabled = config.adEnabledReward === undefined || config.adEnabledReward === 1 || config.adEnabledReward === true;
            return enabled ? (config.rewardUnitId || "") : "";
        }
        case "popup": {
            const enabled = config.adEnabledPopup === undefined || config.adEnabledPopup === 1 || config.adEnabledPopup === true;
            return enabled ? (config.popupUnitId || "") : "";
        }
        case "video": {
            const enabled = config.adEnabledVideo === undefined || config.adEnabledVideo === 1 || config.adEnabledVideo === true;
            return enabled ? (config.videoUnitId || "") : "";
        }
        default:
            return "";
    }
}

/**
 * 组合式广告
 */
export function useAd() {
    const bannerUnitId: ComputedRef<string> = computed(() => getAdUnitId("banner"));
    const gridUnitId: ComputedRef<string> = computed(() => getAdUnitId("grid"));
    const customUnitId: ComputedRef<string> = computed(() => getAdUnitId("custom"));
    const rewardUnitId: ComputedRef<string> = computed(() => getAdUnitId("reward"));
    const popupUnitId: ComputedRef<string> = computed(() => getAdUnitId("popup"));

    return {
        bannerUnitId,
        gridUnitId,
        customUnitId,
        rewardUnitId,
        popupUnitId,
        getUnitId: getAdUnitId,
    };
}

/**
 * 广告播放/加载结果数据结构。
 */
export interface AdRes {
    /** 广告是否正常加载或成功展示完成 */
    success: boolean;
    /** 激励视频是否完全播放完毕 (仅激励视频有此属性) */
    isEnded: boolean;
    /** 加载或展示失败时的错误对象 */
    error?: any;
}

// 缓存不同 Unit ID 的广告实例，防止重复创建导致内存泄露或回调叠加
const adInstances = new Map<string, any>();

// 当前激活的广告单元 ID 与回调函数句柄
let activePopupId = "";
let activeRewardId = "";

let popupCallback: ((ok: boolean) => void) | undefined;
let rewardCallback: ((res: AdRes) => void) | undefined;

let rewardPromise: Promise<AdRes> | null = null;
let rewardResolve: ((res: AdRes) => void) | null = null;

/**
 * 统一触发激励视频广告结束回调并销毁当前的 Promise 句柄
 */
function resolveReward(res: AdRes) {
    rewardCallback?.(res);
    rewardResolve?.(res);
    rewardResolve = null;
    rewardPromise = null;
}

// 配置插屏广告
export function setPopupAd(adId?: string, done?: (ok: boolean) => void): boolean {
    const targetId = adId || getAdUnitId("popup");
    popupCallback = done;
    if (!targetId || !uni.createInterstitialAd) return false;

    activePopupId = targetId;
    if (!adInstances.has(targetId)) {
        try {
            const ad = uni.createInterstitialAd({ adUnitId: targetId });
            ad.onLoad?.(() => console.log(`[Ad] Interstitial loaded: ${targetId}`));
            ad.onError?.((error: any) => {
                console.error("[Ad] Interstitial load error:", error);
                if (activePopupId === targetId) popupCallback?.(false);
            });
            ad.onClose?.(() => {
                if (activePopupId === targetId) popupCallback?.(true);
            });
            adInstances.set(targetId, ad);
        } catch (error) {
            console.error("[Ad] Interstitial creation failed:", error);
            return false;
        }
    }
    return true;
}

// 展示插屏广告
export function showPopupAd(delay = 0, unitId?: string): Promise<boolean> {
    const targetId = unitId || activePopupId || getAdUnitId("popup");
    if (!targetId) return Promise.resolve(false);

    if (!setPopupAd(targetId)) {
        return Promise.resolve(false);
    }

    return new Promise((resolve) => {
        const ad = adInstances.get(targetId);
        if (!ad) {
            resolve(false);
            return;
        }

        const originalDone = popupCallback;
        popupCallback = (ok: boolean) => {
            originalDone?.(ok);
            resolve(ok);
        };

        const executeShow = () => {
            ad.show().catch((error: any) => {
                console.error("[Ad] Interstitial show error:", error);
                popupCallback?.(false);
            });
        };

        if (delay > 0) {
            setTimeout(executeShow, delay);
        } else {
            executeShow();
        }
    });
}

// 配置激励广告
export function setRewardAd(adId?: string, done?: (res: AdRes) => void): Promise<AdRes> {
    const targetId = adId || getAdUnitId("reward");
    rewardCallback = done;
    rewardPromise = new Promise((resolve) => {
        rewardResolve = resolve;
    });

    if (!targetId || !uni.createRewardedVideoAd) {
        resolveReward({ success: false, isEnded: false });
        return rewardPromise;
    }

    activeRewardId = targetId;
    if (!adInstances.has(targetId)) {
        try {
            const ad = uni.createRewardedVideoAd({ adUnitId: targetId });
            ad.onLoad?.(() => console.log(`[Ad] Rewarded video loaded: ${targetId}`));
            ad.onError?.((errorResult: any) => {
                console.error("[Ad] Rewarded video load error:", errorResult);
                if (activeRewardId === targetId) {
                    resolveReward({ success: false, isEnded: false, error: errorResult });
                }
            });
            ad.onClose?.((res: { isEnded?: boolean }) => {
                if (activeRewardId === targetId) {
                    const ended = !!res?.isEnded;
                    resolveReward({ success: ended, isEnded: ended });
                    ad.load().catch((error: any) => {
                        console.warn("[Ad] Silent preload after close failed:", error);
                    });
                }
            });
            adInstances.set(targetId, ad);
        } catch (error) {
            console.error("[Ad] Rewarded video creation failed:", error);
            resolveReward({ success: false, isEnded: false, error });
        }
    }
    return rewardPromise;
}

// 播放激励广告
export function showRewardAd(options?: { unitId?: string; onShowSuccess?: () => void } | (() => void)): Promise<AdRes> {
    const onShowSuccess = typeof options === "function" ? options : options?.onShowSuccess;
    const unitId = typeof options === "object" ? options?.unitId : undefined;
    const targetId = unitId || activeRewardId || getAdUnitId("reward");

    if (!targetId) {
        return Promise.resolve({ success: false, isEnded: false });
    }

    if (!activeRewardId || activeRewardId !== targetId || !adInstances.has(targetId)) {
        setRewardAd(targetId);
    }

    const ad = adInstances.get(targetId);
    if (!ad) {
        return Promise.resolve({ success: false, isEnded: false });
    }

    const current =
        rewardPromise ||
        new Promise<AdRes>((resolve) => {
            rewardResolve = resolve;
        });
    rewardPromise = current;

    ad.show()
        .then(() => {
            onShowSuccess?.();
        })
        .catch(() => {
            ad.load()
                .then(() => {
                    ad.show()
                        .then(() => {
                            onShowSuccess?.();
                        })
                        .catch((errorResult: any) => {
                            console.error("[Ad] Rewarded video show error:", errorResult);
                            resolveReward({ success: false, isEnded: false, error: errorResult });
                        });
                })
                .catch((errorResult: any) => {
                    console.error("[Ad] Rewarded video load error:", errorResult);
                    resolveReward({ success: false, isEnded: false, error: errorResult });
                });
        });

    return current;
}

// 销毁广告实例
export function destroyRewardAd(adId: string) {
    adInstances.delete(adId);
    if (activeRewardId === adId) {
        activeRewardId = "";
        rewardCallback = undefined;
        rewardResolve = null;
        rewardPromise = null;
    }
}

// 确认继续观看
export function confirmRewardAd(): Promise<boolean> {
    return new Promise((resolve) => {
        uni.showModal({
            title: "提示",
            content: "需要看完广告才有奖励哦",
            cancelText: "取消",
            confirmText: "继续观看",
            cancelColor: "#999999",
            confirmColor: "#3b82f6",
            success: (res: any) => {
                resolve(!!res.confirm);
            },
            fail: () => {
                resolve(false);
            },
        });
    });
}

// 播放激励流程
export async function playRewardAd(options: { unitId?: string; retryConfirm?: boolean } = {}): Promise<AdRes> {
    const { unitId, retryConfirm = true } = options;
    const targetId = unitId || getAdUnitId("reward");
    if (!targetId) {
        return { success: false, isEnded: false };
    }

    if (typeof uni !== "undefined" && uni.showLoading) {
        uni.showLoading({ title: "正在拉起广告", mask: true });
    }

    const hideLoading = () => {
        if (typeof uni !== "undefined" && uni.hideLoading) {
            uni.hideLoading();
        }
    };

    const timer = setTimeout(hideLoading, 8000);
    const onEnd = () => {
        clearTimeout(timer);
        hideLoading();
    };

    try {
        setRewardAd(targetId);
        const result = await showRewardAd({ unitId: targetId, onShowSuccess: onEnd });
        onEnd();
        destroyRewardAd(targetId);

        if (result.success && result.isEnded) {
            return result;
        }

        if (retryConfirm && !result.isEnded && !result.error) {
            const retry = await confirmRewardAd();
            if (retry) {
                return await playRewardAd(options);
            }
        }

        return result;
    } catch (error) {
        onEnd();
        destroyRewardAd(targetId);
        return { success: false, isEnded: false, error };
    }
}


