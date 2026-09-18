import { defineStore } from "pinia";

/**
 * 用户资料接口
 */
export interface UserProfile {
    id?: number | string;
    nickname?: string;
    avatarUrl?: string;
    phone?: string;
    gender?: number;
    openid?: string;
    vipTime?: number;
    vipNoAd?: number;
    score?: number;
    [key: string]: unknown;
}

/**
 * 用户状态管理
 */
export const useUserStore = defineStore("user", {
    state: () => ({
        token: "",
        user: null as UserProfile | null,
    }),
    persist: true,
});
