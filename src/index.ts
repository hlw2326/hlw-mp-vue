/**
 * @hlw-mp/vue 统一导出
 */

// Core / 工具
export * from "./core";
export * from "./utils";
export * from "./request";

// 类型
export type { HlwMenuItem } from "./components/hlw-menu/types";
export type { HlwPagingRef, HlwPagingInstance } from "./components/hlw-paging/types";
export type { HlwRewardAdResult } from "./components/hlw-reward-ad/types";

// App 根上下文
export { useApp } from "./app";

// hlw 全局命名空间
export { hlw, type HlwInstance } from "./hlw";

// 指令
export { vCopy } from "./directives";
