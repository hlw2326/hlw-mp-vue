/**
 * useApp - 应用根上下文
 * 生命周期、Pinia、hlw 注入收敛在此。
 */
import { createSSRApp, type App, type Component } from 'vue';
import { hlw } from './hlw';
import { request } from './request';

let _installed = false;

/**
 * 创建 uni-app 应用入口与全局插件配置工具。
 * 
 * @example
 * ```ts
 * import { useApp } from '@hlw-mp/vue';
 * import App from './App.vue';
 * import { createPinia } from 'pinia';
 * 
 * const app = useApp();
 * app.use(createPinia());
 * export const createApp = app.install(App);
 * ```
 */
export function useApp() {
    /** 用于在导出前挂载的插件列表 */
    const _plugins: Array<(app: App) => void> = [];

    /**
     * 注册一个待安装的 Vue 插件（例如 Pinia、Router 或组件库）。
     * 
     * @param pluginOrInstaller Vue 插件或插件安装函数
     */
    function use(pluginOrInstaller: any) {
        _plugins.push((app) => app.use(pluginOrInstaller));
    }

    /**
     * 生成符合 uni-app 约定的 createApp 入口函数。
     * 
     * @param AppComponent 根组件 (通常是 App.vue)
     * @returns 返回符合 uni-app 要求的 createApp 函数
     */
    function install(AppComponent: Component) {
        if (_installed) {
            console.warn('[hlw] useApp().install() 应只调用一次');
        }
        _installed = true;

        /**
         * 创建并返回 uni-app 运行时应用实例。
         */
        function createApp() {
            const app = createSSRApp(AppComponent);
            app.config.globalProperties['hlw'] = hlw;
            _plugins.forEach((fn) => fn(app));
            return { app };
        }

        return createApp;
    }

    return { install, use, hlw, request };
}

