import { defineStore } from "pinia";

// ==========================================
// 1. 主题 (Theme) 预设与类型
// ==========================================



// ==========================================
// 2. 字体大小 (FontSize) 预设与类型
// ==========================================

export interface FontSizePreset {
    id: string;
    name: string;
    class: string;
}

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

// ==========================================
// 3. 字体样式 (FontFamily) 预设与类型
// ==========================================

export interface FontFamilyPreset {
    id: string;
    name: string;
    class: string;
}

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

// ==========================================
// 4. 统一个性化配置 Store (Theme / Font)
// ==========================================

export const useThemeStore = defineStore("theme", {
    state: () => ({
        mode: "light",
        color: "#08c060",
        fontSize: "standard",
        fontFamily: "system",
    }),
    getters: {},
    actions: {
        setMode(mode: string) {
            this.mode = mode;
        },
        setColor(color: string) {
            this.color = color;
        },
        setFontSize(size: string) {
            if (["small", "standard", "large", "extra-large"].includes(size)) {
                this.fontSize = size;
            }
        },
        setFontFamily(font: string) {
            if (["system", "sans", "serif", "kaiti"].includes(font)) {
                this.fontFamily = font;
            }
        },
        reset() {
            this.mode = "light";
            this.color = "#08c060";
            this.fontSize = "standard";
            this.fontFamily = "system";
        },
    },
    unistorage: true,
});
