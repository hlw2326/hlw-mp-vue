# 广告模块 (Ad Utility & Component)

提供微信小程序**插屏广告 (Interstitial Ad)** 与 **激励视频广告 (Rewarded Video Ad)** 的注册、预加载与展示播放能力，并提供了开箱即用的高层封装组件 `<hlw-ad>`。

---

## 1. 推荐：高层组件 `<hlw-ad type="reward">`

组件内部全面封装并接管了激励视频广告的完整生命周期管理：
* **自动读取全局配置**：无需显式传递 `unit-id`，底层自动匹配全局广告配置。
* **Loading 状态处理**：拉起广告时自动弹出全局模态 Loading，防止穿透及多重点击。
* **智能断点续看 (中途退出拦截)**：当用户中途关闭广告时，组件内会自动拦截并弹出二级确认对话框（“继续观看”与“取消”），选择继续将自动递归重新拉起播放。
* **关闭后自动滚加载**：当一次广告播放流关闭（完成或中途取消）后，组件立即在后台重新静默预加载下一个广告，保证下一次秒开。

### 使用示例

```html
<template>
    <hlw-ad type="reward" @close="handleRewardAd">
        <button class="btn">点击观看广告获取金币</button>
    </hlw-ad>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { AdRes } from "@hlw-mp/vue";

const rewardUnitId = ref("adunit-xxx");

function handleRewardAd(res: AdRes) {
    if (res.success && res.isEnded) {
        // 用户已成功并且完整看完激励视频广告
        hlw.$msg.success("观看完成，奖励已发放！");
    } else if (res.err) {
        // 播放出错
        hlw.$msg.toast("广告播放失败，请稍后重试");
    } else {
        // 用户主动中途退出并拒绝继续观看，或其它拉起失败情况
        hlw.$msg.toast("播放中途退出或拉起失败");
    }
}
</script>
```

---

## 2. 底层接口 (Low-Level APIs)

在不需要使用标准 UI 组件而需要通过代码细粒度控盘的自定义场景下，可以直接导入并调用底层方法。

```ts
import { 
    setPopupAd, 
    showPopupAd, 
    setRewardAd, 
    showRewardAd, 
    confirmRewardAd 
} from "@hlw-mp/vue";
```

### 插屏广告 (Interstitial Ad)

```ts
// 1. 初始化并注册插屏广告单元，提供可选的关闭回调
setPopupAd("adunit-popup-id", (success) => {
    console.log("插屏广告被关闭，是否播放成功:", success);
});

// 2. 延迟拉起展示插屏广告 (默认延迟 3000 毫秒展示)
await showPopupAd(1000);
```

### 激励视频广告 (Rewarded Video Ad)

```ts
// 1. 注册并预加载激励视频广告单元
await setRewardAd("adunit-reward-id");

// 2. 立即拉起播放广告
const res = await showRewardAd();

if (res.success && res.isEnded) {
    // 成功发放奖励
} else {
    // 处理退出或报错
}
```

---

## 3. API 列表

| 方法名 | 参数 | 返回值 | 说明 |
| :--- | :--- | :--- | :--- |
| `setPopupAd(adId, done?)` | `adId: string, done?: (ok: boolean) => void` | `boolean` | 创建/拉取缓存的插屏广告实例。 |
| `showPopupAd(delay?)` | `delay?: number` | `Promise<boolean>` | 延迟展示已配置的插屏广告（默认 3000ms）。 |
| `setRewardAd(adId, done?)` | `adId: string, done?: (res: AdRes) => void` | `Promise<AdRes>` | 预加载激励视频广告实例，并在 `onClose` 事件回调中自动加入重新静默预加载功能。 |
| `showRewardAd(onShowSuccess?)` | `onShowSuccess?: () => void` | `Promise<AdRes>` | 立即拉起展示激励视频，拉起失败时自动执行 `load()` 并二次重试。 |
| `confirmRewardAd()` | 无 | `Promise<boolean>` | 内置的通用二级确认模态框，内置灰色取消文字（`#999999`）与蓝色确认文字（`#3b82f6`）。 |

---

## 4. 类型定义

```typescript
export interface AdRes {
    /** 广告是否正常加载或成功展示完成 */
    success: boolean;
    /** 激励视频是否完全播放完毕 (仅激励视频有此属性) */
    isEnded: boolean;
    /** 加载或展示失败时的错误对象 */
    err?: any;
}
```
