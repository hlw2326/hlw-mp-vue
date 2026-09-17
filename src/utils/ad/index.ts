/**
 * 小程序广告工具。
 * 提供插屏广告 (Interstitial Ad) 与激励视频广告 (Rewarded Video Ad) 的注册、缓存与展示能力。
 */

declare const uni: any;

/**
 * 广告播放/加载结果数据结构。
 */
export interface AdRes {
    /** 广告是否正常加载或成功展示完成 */
    success: boolean;
    /** 激励视频是否完全播放完毕 (仅激励视频有此属性) */
    isEnded: boolean;
    /** 加载或展示失败时的错误对象 */
    err?: any;
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

/**
 * 配置/预加载插屏广告
 * 
 * @param adId 广告单元 ID
 * @param done 广告关闭后的回调（可选）
 * @returns 是否配置成功
 */
export function setPopupAd(adId: string, done?: (ok: boolean) => void): boolean {
    popupCallback = done;
    if (!adId || !uni.createInterstitialAd) return false;

    activePopupId = adId;
    if (!adInstances.has(adId)) {
        try {
            const ad = uni.createInterstitialAd({ adUnitId: adId });
            ad.onLoad?.(() => console.log(`[Ad] Interstitial loaded: ${adId}`));
            ad.onError?.((err: any) => {
                console.error("[Ad] Interstitial load error:", err);
                if (activePopupId === adId) popupCallback?.(false);
            });
            ad.onClose?.(() => {
                if (activePopupId === adId) popupCallback?.(true);
            });
            adInstances.set(adId, ad);
        } catch (e) {
            console.error("[Ad] Interstitial creation failed:", e);
            return false;
        }
    }
    return true;
}

/**
 * 延迟展示已配置的插屏广告
 * 
 * @param delay 延迟毫秒数，默认 3000ms
 * @returns 返回 Promise，指示是否成功显示且被关闭
 */
export function showPopupAd(delay = 3000): Promise<boolean> {
    return new Promise((resolve) => {
        const ad = adInstances.get(activePopupId);
        if (!ad) {
            resolve(false);
            return;
        }

        const originalDone = popupCallback;
        popupCallback = (ok: boolean) => {
            originalDone?.(ok);
            resolve(ok);
        };

        setTimeout(
            () => {
                ad.show().catch((err: any) => {
                    console.error("[Ad] Interstitial show error:", err);
                    popupCallback?.(false);
                });
            },
            Math.max(0, delay),
        );
    });
}

/**
 * 配置/预加载激励视频广告
 * 
 * @param adId 广告单元 ID
 * @param done 播放结束的回调（可选）
 * @returns 返回 Promise<AdRes>
 */
export function setRewardAd(adId: string, done?: (res: AdRes) => void): Promise<AdRes> {
    rewardCallback = done;
    rewardPromise = new Promise((resolve) => {
        rewardResolve = resolve;
    });

    if (!adId || !uni.createRewardedVideoAd) {
        resolveReward({ success: false, isEnded: false });
        return rewardPromise;
    }

    activeRewardId = adId;
    if (!adInstances.has(adId)) {
        try {
            const ad = uni.createRewardedVideoAd({ adUnitId: adId });
            ad.onLoad?.(() => console.log(`[Ad] Rewarded video loaded: ${adId}`));
            ad.onError?.((err: any) => {
                console.error("[Ad] Rewarded video load error:", err);
                if (activeRewardId === adId) {
                    resolveReward({ success: false, isEnded: false, err });
                }
            });
            ad.onClose?.((res: { isEnded?: boolean }) => {
                if (activeRewardId === adId) {
                    const ended = !!res?.isEnded;
                    resolveReward({ success: ended, isEnded: ended });
                    // 播放结束后立即在后台静默预加载下一个广告，以保证后续拉起流畅且支持重试逻辑
                    ad.load().catch((err: any) => {
                        console.warn("[Ad] Silent preload after close failed:", err);
                    });
                }
            });
            adInstances.set(adId, ad);
        } catch (e) {
            console.error("[Ad] Rewarded video creation failed:", e);
            resolveReward({ success: false, isEnded: false, err: e });
        }
    }
    return rewardPromise;
}

/**
 * 立即播放已加载的激励视频广告
 * 
 * @param onShowSuccess 广告成功拉起播放时的回调（常用于关闭 Loading 等待提示）
 * @returns 返回 Promise<AdRes>，指示广告是否正常播放完毕
 */
export function showRewardAd(onShowSuccess?: () => void): Promise<AdRes> {
    const ad = adInstances.get(activeRewardId);
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
                        .catch((err: any) => {
                            console.error("[Ad] Rewarded video show error:", err);
                            resolveReward({ success: false, isEnded: false, err });
                        });
                })
                .catch((err: any) => {
                    console.error("[Ad] Rewarded video load error:", err);
                    resolveReward({ success: false, isEnded: false, err });
                });
        });

    return current;
}

/**
 * 销毁指定 Unit ID 的激励视频广告实例，释放内存与原生渲染层绑定并清除缓存。
 * 
 * @param adId 广告单元 ID
 */
export function destroyRewardAd(adId: string) {
    // 仅从本地缓存 Map 中移除该广告单元的实例引用，并清理相关状态，严禁调用 ad.destroy()
    // 因为微信小程序的 wx.createRewardedVideoAd 在整个应用生命周期中为全局单例，
    // 一旦销毁 (destroy) 后，后续再次 create 该广告位 ID 将永远返回已销毁的实例，导致报错 "video-ad has been destroyed"
    adInstances.delete(adId);
    if (activeRewardId === adId) {
        activeRewardId = "";
        rewardCallback = undefined;
        rewardResolve = null;
        rewardPromise = null;
    }
}

/**
 * 弹窗提示需要看完广告才有奖励。
 * 提供“继续观看”和“取消”按钮。
 * @returns 返回 Promise<boolean>，用户点击“继续”返回 true，点击“取消”返回 false
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
 * @deprecated 推荐直接从库导入独立函数使用 (例如：import { showRewardAd } from '@hlw-mp/vue')
 */
export function useHlwAd() {
    return {
        setPopupAd,
        showPopupAd,
        setRewardAd,
        showRewardAd,
        confirmRewardAd,
        destroyRewardAd,
    };
}
