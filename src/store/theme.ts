import { defineStore } from "pinia";
import type { FontSizePreset, FontFamilyPreset } from "./types";

/**
 * 字体大小表
 */
export const fontSizePresets: FontSizePreset[] = [
    {
        id: "small",
        name: "较小",
        class: "font-size-small",
    },
    {
        id: "standard",
        name: "标准",
        class: "font-size-standard",
    },
    {
        id: "large",
        name: "较大",
        class: "font-size-large",
    },
    {
        id: "extra-large",
        name: "超大",
        class: "font-size-extra-large",
    },
];

/**
 * 字体样式表
 */
export const fontFamilyPresets: FontFamilyPreset[] = [
    {
        id: "system",
        name: "系统默认",
        class: "font-family-system",
    },
    {
        id: "sans",
        name: "现代黑体",
        class: "font-family-sans",
    },
    {
        id: "serif",
        name: "经典宋体",
        class: "font-family-serif",
    },
    {
        id: "kaiti",
        name: "优雅楷体",
        class: "font-family-kaiti",
    },
];

/**
 * 主题状态库
 */
export const useThemeStore = defineStore("theme", {
    state: () => ({
        mode: "light",
        color: "#08c060",
        fontSize: "standard",
        fontFamily: "system",
    }),
    persist: true,
});
