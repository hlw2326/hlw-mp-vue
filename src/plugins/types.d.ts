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
        /** 存储持久配置 */
        unistorage?: boolean | PersistOptions;
    }
}

