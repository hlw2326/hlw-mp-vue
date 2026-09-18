/** 图标主题色，对应预设的背景色 + 前景色组合 */
export type HlwMenuIconTheme = "orange" | "purple" | "cyan" | "emerald" | "slate" | "wechat" | "rose" | "blue" | "red";

/** 标签 / 角标的主题色 */
export type HlwMenuTagTheme = "orange" | "red" | "wechat" | "rose" | "blue";

export interface HlwMenuItem {
    /**
     * 图标的 CSS class，使用 UnoCSS / iconify 图标名。
     * @example "i-fa6-solid-gear"
     */
    icon: string;
    /**
     * 图标背景色主题。不传默认使用 `slate`（灰色）。
     * @default "slate"
     */
    iconTheme?: HlwMenuIconTheme;
    /** 菜单项文字 */
    label: string;
    /**
     * 跳转路径。有值时使用 `<navigator>` 包裹，点击直接跳转，不触发 `click` 事件。
     * @example "/pages/setting/index"
     */
    url?: string;
    /**
     * 右侧纯文字说明，仅列表模式显示。适合展示版本号、状态等辅助信息。
     * @example "v1.2.0"
     */
    value?: string;
    /**
     * 右侧彩色标签文字（列表模式）或图标右上角角标文字（宫格模式）。
     * @example "NEW"
     */
    tag?: string;
    /**
     * 标签 / 角标的主题色。不传默认 `rose`（红色）。
     * @default "rose"
     */
    tagTheme?: HlwMenuTagTheme;
    /**
     * 标签是否呼吸闪烁动画，用于吸引用户注意。
     * @default false
     */
    tagPulse?: boolean;
    /**
     * 显示加载中转圈图标，仅列表模式生效。适合异步操作进行中的状态。
     * @default false
     */
    loading?: boolean;
    /**
     * 是否渲染该菜单项。`false` 时从列表中隐藏，不占位。
     * @default true
     */
    visible?: boolean;
    /**
     * 微信小程序 `<button open-type>` 能力。设置后菜单项用 `<button>` 渲染，
     * 支持触发客服会话、获取手机号、分享等原生能力。
     *
     * 常用值：
     * - `contact` — 打开客服会话（需在后台配置客服）
     * - `share` — 触发分享
     * - `getPhoneNumber` — 获取手机号
     * - `launchApp` — 打开 App（仅 App 内）
     *
     * 参考：https://developers.weixin.qq.com/miniprogram/dev/component/button.html
     */
    openType?: string;
    /**
     * 会话来源，`openType="contact"` 时有效。
     */
    sessionFrom?: string;
    /**
     * 会话内消息卡片标题，`openType="contact"` 时有效。
     */
    sendMessageTitle?: string;
    /**
     * 会话内消息卡片点击跳转小程序路径，`openType="contact"` 时有效。
     */
    sendMessagePath?: string;
    /**
     * 会话内消息卡片图片，`openType="contact"` 时有效。
     */
    sendMessageImg?: string;
    /**
     * 是否显示会话内消息卡片，`openType="contact"` 时有效。
     * @default false
     */
    showMessageCard?: boolean;
}
