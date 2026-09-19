import { computed, toRef } from "vue";
import { useUserStore } from "../../store/user";
import type { UserProfile } from "../../store/types";

/**
 * 用户组合函数
 */
export function useUser() {
    const store = useUserStore();
    const token = toRef(store, "token");
    const user = toRef(store, "user");
    const isLogin = computed(() => Boolean(store.token));

    /**
     * 设置登录凭据
     */
    function setToken(tokenValue: string): void {
        store.token = tokenValue;
    }

    /**
     * 设置用户资料
     */
    function setUser(profile: UserProfile | null): void {
        store.user = profile;
    }

    /**
     * 更新部分资料
     */
    function updateUser(patch: Partial<UserProfile>): void {
        if (store.user) {
            store.user = { ...store.user, ...patch };
        }
    }

    /**
     * 清理登录状态
     */
    function logout(): void {
        store.token = "";
        store.user = null;
    }

    return {
        token,
        user,
        isLogin,
        setToken,
        setUser,
        updateUser,
        logout,
        store,
    };
}

