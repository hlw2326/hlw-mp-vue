import type { PiniaPluginContext } from "pinia";

/**
 * 持久化配置项
 */
export interface PersistOptions {
    /** 自定义存储键 */
    key?: string;
    /** 持久化白名单 */
    paths?: string[];
}

declare module "pinia" {
    interface DefineStoreOptionsBase<S, Store> {
        /** 兼容旧版配置 */
        unistorage?: boolean | PersistOptions;
        /** 标准持久配置 */
        persist?: boolean | PersistOptions;
    }
}

/**
 * 持久插件工厂
 */
export function createPersist() {
    return (context: PiniaPluginContext): void => {
        const { store, options } = context;
        const config = options.persist ?? options.unistorage;
        if (!config) return;

        const isCustom = typeof config === "object" && config !== null;
        const storageKey = isCustom && config.key ? config.key : store.$id;
        const paths = isCustom ? config.paths : undefined;

        // 恢复初始状态
        try {
            const cached = uni.getStorageSync(storageKey);
            if (cached) {
                const data = typeof cached === "string" ? JSON.parse(cached) : cached;
                if (typeof data === "object" && data !== null) {
                    store.$patch(data);
                }
            }
        } catch (error) {
            console.error(`[Persist] 恢复 ${store.$id} 失败:`, error);
        }

        // 监听变更持久
        store.$subscribe(
            (_, state) => {
                try {
                    let toSave = state;
                    if (paths && Array.isArray(paths)) {
                        toSave = paths.reduce((acc, key) => {
                            if (key in state) (acc as any)[key] = (state as any)[key];
                            return acc;
                        }, {} as Record<string, unknown>);
                    }
                    uni.setStorageSync(storageKey, toSave);
                } catch (error) {
                    console.error(`[Persist] 保存 ${store.$id} 失败:`, error);
                }
            },
            { detached: true }
        );
    };
}

/**
 * 兼容旧版命名
 */
export const createUnistorage = createPersist;
