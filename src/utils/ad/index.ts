/**
 * 小程序广告工具。
 * 提供插屏广告 (Interstitial Ad) 与激励视频广告 (Rewarded Video Ad) 的注册、缓存与展示能力。
 */

declare const uni: any;

import type { AdRes } from "./types";

export type { AdRes };

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

/**
 * 在当前页面上下文中初始化插屏广告（销毁旧实例并重建，确保广告归属当前页面）
 */
export function initPopupAd(adId?: string): any {
    const targetId = adId || activePopupId;
    if (!targetId) return null;
    activePopupId = targetId;

    // 销毁跨页面遗留的旧实例，杜绝 2005 报错
    const oldAd = adInstances.get(targetId);
    if (oldAd) {
        try {
            oldAd.destroy?.();
        } catch {
            // ignore
        }
        adInstances.delete(targetId);
    }

    try {
        if (typeof uni !== "undefined" && typeof uni.createInterstitialAd === "function") {
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
            return ad;
        }
    } catch (error) {
        console.error("[Ad] Interstitial creation failed:", error);
    }
    return null;
}

/**
 * 配置插屏广告
 */
export function setPopupAd(adId?: string, done?: (ok: boolean) => void): boolean {
    const targetId = adId || activePopupId;
    popupCallback = done;
    if (!targetId) return false;

    activePopupId = targetId;
    if (!adInstances.has(targetId)) {
        return !!initPopupAd(targetId);
    }
    return true;
}

/**
 * 展示插屏广告
 */
export function showPopupAd(arg1?: string | number, arg2?: string | number): Promise<boolean> {
    let unitId = "";
    let delay = 0;
    if (typeof arg1 === "string") {
        unitId = arg1;
        delay = typeof arg2 === "number" ? arg2 : 0;
    } else if (typeof arg1 === "number") {
        delay = arg1;
        unitId = typeof arg2 === "string" ? arg2 : "";
    }

    const targetId = unitId || activePopupId;
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
                // 遇到 2005 跨页面调用错误时，自动在当前活跃页面重新初始化并静默重试一次
                const isPageError = error && (error.errCode === 2005 || error.errCode === "2005" || String(error.errMsg || "").includes("并非当前页面调用"));
                if (isPageError) {
                    try {
                        const newAd = initPopupAd(targetId);
                        if (newAd) {
                            newAd.show().then(() => {
                                popupCallback?.(true);
                            }).catch((e: any) => {
                                console.warn("[Ad] Interstitial retry error:", e);
                                popupCallback?.(false);
                            });
                            return;
                        }
                    } catch {
                        // ignore
                    }
                }
                console.warn("[Ad] Interstitial show failed:", error);
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

/**
 * 配置激励广告
 */
export function setRewardAd(adId?: string, done?: (res: AdRes) => void): Promise<AdRes> {
    const targetId = adId || activeRewardId;
    rewardCallback = done;
    rewardPromise = new Promise((resolve) => {
        rewardResolve = resolve;
    });

    if (!targetId) {
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

/**
 * 播放激励广告
 */
export function showRewardAd(options?: { unitId?: string; onShowSuccess?: () => void } | (() => void)): Promise<AdRes> {
    const onShowSuccess = typeof options === "function" ? options : options?.onShowSuccess;
    const unitId = typeof options === "object" ? options?.unitId : undefined;
    const targetId = unitId || activeRewardId;

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

    ad.show().then(() => {
        onShowSuccess?.();
    }).catch(() => {
        ad.load().then(() => {
            ad.show().then(() => {
                onShowSuccess?.();
            }).catch((errorResult: any) => {
                console.error("[Ad] Rewarded video show error:", errorResult);
                resolveReward({ success: false, isEnded: false, error: errorResult });
            });
        }).catch((errorResult: any) => {
            console.error("[Ad] Rewarded video load error:", errorResult);
            resolveReward({ success: false, isEnded: false, error: errorResult });
        });
    });

    return current;
}

/**
 * 销毁广告实例
 */
export function destroyRewardAd(adId: string): void {
    adInstances.delete(adId);
    if (activeRewardId === adId) {
        activeRewardId = "";
        rewardCallback = undefined;
        rewardResolve = null;
        rewardPromise = null;
    }
}

/**
 * 确认继续观看
 */
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

/**
 * 播放激励流程
 */
export async function playRewardAd(options: { unitId?: string; retryConfirm?: boolean } = {}): Promise<AdRes> {
    const { unitId, retryConfirm = true } = options;
    const targetId = unitId || activeRewardId;
    if (!targetId) {
        return { success: false, isEnded: false };
    }

    uni.showLoading({ title: "正在拉起广告", mask: true });

    const hideLoading = () => {
        uni.hideLoading();
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
