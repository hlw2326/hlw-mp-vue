import { defineStore } from "pinia";
import type { UserProfile } from "./types";

/**
 * 用户状态管理
 */
export const useUserStore = defineStore("user", {
    state: () => ({
        token: "",
        user: null as UserProfile | null,
    }),
    unistorage: true,
});

