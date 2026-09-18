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
    getters: {
        /**
         * 是否登录状态
         */
        isLogin: (state): boolean => Boolean(state.token),
    },
    actions: {
        /**
         * 设置登录凭据
         */
        setToken(token: string): void {
            this.token = token;
            uni.setStorageSync("token", token);
        },
        /**
         * 设置用户资料
         */
        setUser(user: UserProfile | null): void {
            this.user = user;
            if (user) {
                uni.setStorageSync("userInfo", user);
            } else {
                uni.removeStorageSync("userInfo");
            }
        },
        /**
         * 更新部分资料
         */
        updateUser(patch: Partial<UserProfile>): void {
            if (this.user) {
                this.user = { ...this.user, ...patch };
                uni.setStorageSync("userInfo", this.user);
            }
        },
        /**
         * 清理登录状态
         */
        logout(): void {
            this.token = "";
            this.user = null;
            uni.removeStorageSync("token");
            uni.removeStorageSync("userInfo");
        },
        /**
         * 重置状态数据
         */
        reset(): void {
            this.logout();
        },
    },
    unistorage: true,
});
