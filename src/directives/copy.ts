/**
 * v-copy 指令 - 点击自动复制文本
 *
 * 用法：
 *   <view v-copy="text">...</view>
 *   <text v-copy="userId">{{ userId }}</text>
 */
import type { Directive, DirectiveBinding, VNode } from 'vue';

/**
 * 将文本复制到系统剪贴板，并显示成功提示。
 * 
 * @param data 待复制的字符串
 */
function copyText(data: string) {
    uni.setClipboardData({
        data,
        showToast: false, // 禁用系统默认 Toast 提示，使用自定义的无图标 Toast
        success: () => uni.showToast({ title: '复制成功', icon: 'none', duration: 1500 }),
    });
}

/**
 * 向虚拟节点 (VNode) 的 props 中注入 onTap 事件。
 * 当用户点击该组件时，执行原有的点击事件后自动触发复制绑定值。
 * 
 * @param vnode 虚拟 DOM 节点
 * @param binding 指令绑定对象
 */
function injectTap(vnode: VNode, binding: DirectiveBinding) {
    if (!vnode.props) (vnode as any).props = {};
    const props = vnode.props as Record<string, any>;
    const prev = props.onTap;

    props.onTap = (event: any) => {
        prev?.(event);
        const value = binding.value;
        if (value == null || value === '') return;
        copyText(String(value));
    };
}

/**
 * 自定义 Vue 指令 `v-copy`
 * 
 * 在元素/组件被创建或更新前，拦截其点击事件并注入复制剪贴板逻辑。
 */
export const vCopy: Directive = {
    /**
     * 在指令创建时注入点击事件拦截器。
     */
    created(element: any, binding: DirectiveBinding, vnode: VNode) {
        injectTap(vnode, binding);
    },
    /**
     * 在绑定值更新前重新注入点击事件拦截器，以获取最新的绑定值。
     */
    beforeUpdate(element: any, binding: DirectiveBinding, vnode: VNode) {
        injectTap(vnode, binding);
    },
};

