import { computed, toRef } from "vue";
import { useUserStore, type UserProfile } from "../../stores/user";

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
    const isLogin = computed(() => store.isLogin);

    function setToken(tokenValue: string): void {
        store.setToken(tokenValue);
    }

    function setUser(profile: UserProfile | null): void {
        store.setUser(profile);
    }

    function updateUser(patch: Partial<UserProfile>): void {
        store.updateUser(patch);
    }

    function logout(): void {
        store.logout();
    }

    function reset(): void {
        store.reset();
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

export type { UserProfile } from "../../stores/user";
