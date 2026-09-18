import { computed, toRef } from "vue";
import { useUserStore } from "../../store/user";
import type { UserProfile } from "../../store/types";

/**
 * 用户状态门面
 */
export const user = {
    /**
     * 获取凭证字符
     */
    token(): string {
        return uni.getStorageSync("token") || "";
    },
    /**
     * 获取用户资料
     */
    info(): Record<string, unknown> {
        return uni.getStorageSync("userInfo") || {};
    },
};

/**
 * 用户组合函数
 */
export function useUser() {
    const store = useUserStore();
    const token = toRef(store, "token");
    const userProfile = toRef(store, "user");
    const isLogin = computed(() => Boolean(store.token));

    /**
     * 设置登录凭据
     */
    function setToken(tokenValue: string): void {
        store.token = tokenValue;
        uni.setStorageSync("token", tokenValue);
    }

    /**
     * 设置用户资料
     */
    function setUser(profile: UserProfile | null): void {
        store.user = profile;
        if (profile) {
            uni.setStorageSync("userInfo", profile);
        } else {
            uni.removeStorageSync("userInfo");
        }
    }

    /**
     * 更新部分资料
     */
    function updateUser(patch: Partial<UserProfile>): void {
        if (store.user) {
            store.user = { ...store.user, ...patch };
            uni.setStorageSync("userInfo", store.user);
        }
    }

    /**
     * 清理登录状态
     */
    function logout(): void {
        store.token = "";
        store.user = null;
        uni.removeStorageSync("token");
        uni.removeStorageSync("userInfo");
    }

    /**
     * 重置状态数据
     */
    function reset(): void {
        logout();
    }

    return {
        token,
        user: userProfile,
        isLogin,
        setToken,
        setUser,
        updateUser,
        logout,
        reset,
        store,
    };
}

export type { UserProfile } from "../../store/types";
