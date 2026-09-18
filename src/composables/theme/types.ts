/**
 * 外观模式型
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * 字体大小型
 */
export type FontSize = "small" | "standard" | "large" | "extra-large";

/**
 * 字体样式型
 */
export type FontFamily = "system" | "sans" | "serif" | "kaiti";

/**
 * 主题色彩项
 */
export interface ThemeColor {
    name: string;
    value: string;
}

/**
 * 主题状态表
 */
export interface ThemeState {
    mode: ThemeMode;
    color: string;
    size: FontSize;
    fontSize?: FontSize;
    font?: FontFamily;
    fontFamily?: FontFamily;
}

/**
 * 初始配置项
 */
export interface InitThemeOptions {
    sync?: boolean;
    defaultTheme?: Partial<ThemeState>;
}
