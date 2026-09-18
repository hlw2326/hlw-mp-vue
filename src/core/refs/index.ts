/**
 * useRefs - 模板 Ref 批量管理
 * 
 * 主要用于在 v-for 循环场景下，动态收集一组子元素或子组件的引用实例。
 * 规避了 Vue3 在 v-for 中绑定 ref 时需要手动处理数组收集和清理的冗余逻辑。
 */
import { ref, onBeforeUpdate, onUnmounted } from "vue";

/**
 * 管理动态 ref 集合的 hook，尤其适合 v-for 列表场景。
 * 
 * @example
 * ```vue
 * <template>
 *   <view v-for="item in list" :key="item.id" :ref="setRefs(item.id)">
 *     {{ item.name }}
 *   </view>
 * </template>
 * 
 * <script setup>
 * const { refs, setRefs } = useRefs();
 * // 访问特定子项的 DOM/实例: refs.value[itemId]
 * </script>
 * ```
 */
export function useRefs() {
    /** 存放动态收集到的所有组件或 DOM 实例的 Key-Value 映射对象 */
    const refs = ref<Record<string, any>>({});

    // 每次组件更新前清空缓存，以便重新收集最新存在的元素引用
    onBeforeUpdate(() => {
        refs.value = {};
    });

    // 组件卸载时清空所有引用，防止内存泄漏
    onUnmounted(() => {
        refs.value = {};
    });

    /**
     * 按 key 生成一个 ref 绑定回调函数。
     * Vue 模板的 `:ref` 绑定此返回值后，会自动在挂载时填入实例，卸载时清除。
     * 
     * @param key 标识该子项的唯一 Key
     * @returns 用于 ref 绑定的回调函数
     */
    const setRefs = (key: string) => (element: any) => {
        if (element) refs.value[key] = element;
    };

    return { refs, setRefs };
}
