import type { App, ComputedRef, Ref } from "vue";
import { computed, toRef } from "vue";
import {
    useThemeStore,
    fontSizePresets,
    fontFamilyPresets,
} from "../../store/theme";
import type {
    ThemeMode,
    FontSize,
    FontFamily,
    ThemeColor,
    ThemeState,
    InitThemeOptions,
} from "./types";

export type { ThemeMode, FontSize, FontFamily, ThemeColor, ThemeState, InitThemeOptions } from "./types";

/**
 * 默认主题配
 */
export const DEFAULT_THEME: ThemeState = {
    mode: "light",
    color: "#08c060",
    fontSize: "standard",
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

/**
 * 获取存储配
 * @returns 当前主题配
 */
export function getTheme(): ThemeState {
    const store = useThemeStore();
    return {
        mode: (store.mode || DEFAULT_THEME.mode) as ThemeMode,
        color: store.color || DEFAULT_THEME.color,
        fontSize: (store.fontSize || DEFAULT_THEME.fontSize) as FontSize,
        fontFamily: (store.fontFamily || DEFAULT_THEME.fontFamily) as FontFamily,
    };
}

/**
 * 应用主题态
 * @param themeState 主题配置项
 */
export function applyTheme(themeState: Partial<ThemeState>): void {
    const store = useThemeStore();
    if (themeState.mode) store.mode = themeState.mode;
    if (themeState.color) store.color = themeState.color;
    if (themeState.fontSize && ["small", "standard", "large", "extra-large"].includes(themeState.fontSize)) {
        store.fontSize = themeState.fontSize;
    }
    if (themeState.fontFamily && ["system", "sans", "serif", "kaiti"].includes(themeState.fontFamily)) {
        store.fontFamily = themeState.fontFamily;
    }
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
    const fontSize: Ref<string> = toRef(store, "fontSize");
    const fontFamily: Ref<string> = toRef(store, "fontFamily");

    const fontSizeClass: ComputedRef<string> = computed(() => {
        const found = fontSizePresets.find((item) => item.id === store.fontSize);
        return found ? found.class : "font-size-standard";
    });

    const fontFamilyClass: ComputedRef<string> = computed(() => {
        const found = fontFamilyPresets.find((item) => item.id === store.fontFamily);
        return found ? found.class : "font-family-system";
    });

    /**
     * 设置外观模
     */
    function setMode(targetMode: ThemeMode): void {
        store.mode = targetMode;
    }

    /**
     * 设置主题色
     */
    function setColor(hexColor: string): void {
        store.color = hexColor;
    }

    /**
     * 设置字号字
     */
    function setFontSize(targetSize: string): void {
        if (["small", "standard", "large", "extra-large"].includes(targetSize)) {
            store.fontSize = targetSize;
        }
    }

    /**
     * 设置字体样
     */
    function setFontFamily(targetFont: string): void {
        if (["system", "sans", "serif", "kaiti"].includes(targetFont)) {
            store.fontFamily = targetFont;
        }
    }

    /**
     * 重置主题配
     */
    function resetTheme(): void {
        store.mode = DEFAULT_THEME.mode;
        store.color = DEFAULT_THEME.color;
        store.fontSize = DEFAULT_THEME.fontSize;
        store.fontFamily = DEFAULT_THEME.fontFamily;
    }

    return {
        mode,
        color,
        fontSize,
        fontSizeClass,
        fontFamily,
        fontFamilyClass,
        colors: THEME_COLORS,
        fontSizePresets,
        fontFamilyPresets,
        setMode,
        setColor,
        setFontSize,
        setFontFamily,
        resetTheme,
        applyTheme,
        getTheme,
        initTheme,
        store,
    };
}

