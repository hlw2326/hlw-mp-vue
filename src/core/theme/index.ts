import type { App, ComputedRef, Ref } from "vue";
import { computed, toRef } from "vue";
import {
    useThemeStore,
    fontSizePresets,
    fontFamilyPresets,
    type FontSizePreset,
    type FontFamilyPreset,
} from "../../stores/theme";
import type {
    ThemeMode,
    FontSize,
    FontFamily,
    ThemeColor,
    ThemeState,
    InitThemeOptions,
} from "./types";

declare const uni: any;

export {
    useThemeStore,
    fontSizePresets,
    type FontSizePreset,
    fontFamilyPresets,
    type FontFamilyPreset,
};
export * from "./types";

/**
 * 默认主题配
 */
export const DEFAULT_THEME: ThemeState = {
    mode: "light",
    color: "#08c060",
    size: "standard",
    fontSize: "standard",
    font: "system",
    fontFamily: "system",
};

/**
 * 预设色彩库
 */
export const THEME_COLORS: ThemeColor[] = [
    { name: "默认生机绿", value: "#08c060" },
    { name: "极光科技蓝", value: "#3b82f6" },
    { name: "翡翠宝石绿", value: "#10b981" },
    { name: "典雅梦幻紫", value: "#8b5cf6" },
    { name: "活力阳光橙", value: "#f97316" },
    { name: "热情火热红", value: "#ef4444" },
    { name: "赛博青蓝", value: "#06b6d4" },
    { name: "经典雅黛黑", value: "#334155" },
    { name: "浪漫蔷薇粉", value: "#ec4899" },
];

const THEME_KEY = "theme";

/**
 * 获取存储配
 * @returns 当前主题配
 */
export function getTheme(): ThemeState {
    try {
        if (typeof uni !== "undefined" && typeof uni.getStorageSync === "function") {
            const saved = uni.getStorageSync(THEME_KEY);
            if (saved && typeof saved === "object") {
                const size = (saved.fontSize || saved.size || DEFAULT_THEME.size) as FontSize;
                const font = (saved.fontFamily || saved.font || DEFAULT_THEME.font) as FontFamily;
                return {
                    mode: (saved.mode || DEFAULT_THEME.mode) as ThemeMode,
                    color: saved.color || DEFAULT_THEME.color,
                    size,
                    fontSize: size,
                    font,
                    fontFamily: font,
                };
            }
        }
    } catch (error) {
        console.error("[Theme] 读取异常:", error);
    }
    return { ...DEFAULT_THEME };
}

/**
 * 保存主题配
 * @param themeState 目标主题配
 */
export function saveTheme(themeState: Partial<ThemeState>): void {
    try {
        const current = getTheme();
        const next = { ...current, ...themeState };
        if (next.size && !next.fontSize) next.fontSize = next.size;
        if (next.fontSize && !next.size) next.size = next.fontSize;
        if (next.font && !next.fontFamily) next.fontFamily = next.font;
        if (next.fontFamily && !next.font) next.font = next.fontFamily;
        if (typeof uni !== "undefined" && typeof uni.setStorageSync === "function") {
            uni.setStorageSync(THEME_KEY, next);
        }
    } catch (error) {
        console.error("[Theme] 写入异常:", error);
    }
}

/**
 * 应用主题态
 * @param themeState 主题配置项
 */
export function applyTheme(themeState: Partial<ThemeState>): void {
    const targetSize = themeState.fontSize || themeState.size;
    const targetFont = themeState.fontFamily || themeState.font;
    try {
        const store = useThemeStore();
        if (themeState.mode) store.setMode(themeState.mode);
        if (themeState.color) store.setColor(themeState.color);
        if (targetSize) store.setFontSize(targetSize);
        if (targetFont) store.setFontFamily(targetFont);
    } catch {
        // 容错忽略
    }
    saveTheme(themeState);
}

/**
 * 注册主题器
 * @param app 应用实例体
 * @param options 初始配置项
 */
export function initTheme(app: any, options: InitThemeOptions = {}): void {
    const { sync = true, defaultTheme } = options;

    app.config.globalProperties.$theme = useTheme();
    app.provide("theme", useTheme());

    if (sync) {
        const initial = defaultTheme ? { ...getTheme(), ...defaultTheme } : getTheme();
        applyTheme(initial);
    }
}

/**
 * 主题组合钩
 * @returns 主题操作体
 */
export function useTheme() {
    const store = useThemeStore();

    const mode: Ref<ThemeMode> = toRef(store, "mode") as unknown as Ref<ThemeMode>;
    const color: Ref<string> = toRef(store, "color");
    const size: Ref<FontSize> = toRef(store, "fontSize") as unknown as Ref<FontSize>;
    const fontSize: Ref<string> = toRef(store, "fontSize");
    const font: Ref<FontFamily> = toRef(store, "fontFamily") as unknown as Ref<FontFamily>;
    const fontFamily: Ref<string> = toRef(store, "fontFamily");

    const fontSizeClass: ComputedRef<string> = computed(() => {
        const found = fontSizePresets.find((p) => p.id === store.fontSize);
        return found ? found.class : "font-size-standard";
    });

    const fontFamilyClass: ComputedRef<string> = computed(() => {
        const found = fontFamilyPresets.find((p) => p.id === store.fontFamily);
        return found ? found.class : "font-family-system";
    });

    function setMode(targetMode: ThemeMode): void {
        store.setMode(targetMode);
        saveTheme({ mode: targetMode });
    }

    function setColor(hexColor: string): void {
        store.setColor(hexColor);
        saveTheme({ color: hexColor });
    }

    function setSize(targetSize: FontSize): void {
        store.setFontSize(targetSize);
        saveTheme({ size: targetSize, fontSize: targetSize });
    }

    function setFontSize(targetSize: string): void {
        store.setFontSize(targetSize);
        saveTheme({ size: targetSize as FontSize, fontSize: targetSize as FontSize });
    }

    function setFontFamily(targetFont: string): void {
        store.setFontFamily(targetFont);
        saveTheme({ font: targetFont as FontFamily, fontFamily: targetFont as FontFamily });
    }

    function resetTheme(): void {
        store.reset();
        saveTheme(DEFAULT_THEME);
    }

    return {
        mode,
        color,
        size,
        font,
        fontSize,
        fontSizeClass,
        fontFamily,
        fontFamilyClass,
        colors: THEME_COLORS,
        fontSizePresets,
        fontFamilyPresets,
        setMode,
        setColor,
        setSize,
        setFontSize,
        setFontFamily,
        resetTheme,
        applyTheme,
        getTheme,
        initTheme,
        store,
    };
}
