# @hlw-mp/vue

<p align="center">
  <img src="https://img.shields.io/badge/vue-3.x-emerald.svg" alt="Vue 3">
  <img src="https://img.shields.io/badge/typescript-supported-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/platform-uni--app-red.svg" alt="uni-app">
</p>

> **hlw-uni 小程序运行时核心组件与工具包**  
> 整合了核心 UI 组件库、全局个性化主题控制、高可用网络请求封装、Vue 核心 Hooks 以及常用无状态工具函数。

---

## ✨ 特性

- 🚀 **响应式 & 声明式** — 全面拥抱 Vue 3 Composition API 与 `<script setup>`。
- 📐 **完全类型安全** — 100% 采用 TypeScript 编写，提供精确的类型推导与卓越的 IDE 自动补全。
- 🎨 **动态主题机制** — 基于 CSS 变量的极简主题管理，支持应用级与页面级动态刷新，自动更新系统导航栏配色。
- 🔗 **统一导出机制** — 统一通过 `@hlw-mp/vue` 单一出口导出，无需零散引入，支持高效的 Tree-shaking。
- 🧩 **easycom 自动按需引入** — 完美融入 uni-app `easycom` 生态，UI 组件即写即用，零体积负担。
- 🛠️ **清晰的架构分离** — 严格划分 `core/`（有状态生命周期 Hooks）与 `utils/`（纯无状态静态工具函数），杜绝代码逻辑耦合。

---

## 📦 安装与配置

### 1. 安装组件库

```bash
pnpm add @hlw-mp/vue
```

> [!NOTE]
> **依赖项要求**
> - `vue >= 3.4.0`
> - `pinia >= 2.0.0` (主题管理状态存储)

### 2. pages.json 自动注册配置

在业务项目的 `pages.json` 中配置 `easycom`，即可在页面中直接使用 `hlw-` 开头的 UI 组件，**无需手动 import 注册**：

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^hlw-(.*)": "@hlw-mp/vue/src/components/hlw-$1/index.vue"
    }
  },
  "pages": [
    // ...
  ]
}
```

---

## 🧱 核心设计架构

类库严格区分为 **`core/`**（有状态，依赖 Vue 响应式与生命周期 API）与 **`utils/`**（纯无状态，提供命令式调用及内联支持）两大模块，并在包根目录统一导出：

```
mp-vue/src/
├── core/             # Vue 核心（有状态，依赖 Vue 响应式与生命周期 API）
│   ├── theme/        # 个性化主题与外观控制 (useTheme, initTheme)
│   ├── msg/          # 交互反馈 (useMsg, hlw.$msg)
│   ├── refs/         # 动态模板 Ref 集合收集 (useRefs)
│   └── share/        # 小程序页面分享控制 (useShare)
├── utils/            # 纯无状态工具集（无生命周期依赖，支持直接/内联调用）
│   ├── ad/           # 广告控制器 (setAdPopup, showAdPopup, setAdReward, showAdReward)
│   ├── common/       # 公共工具函数 (copy, paste, saveImageUrl, saveVideoUrl, download 等)
│   ├── navigator/    # 路由跳转 (navigate, navigateTo, redirectTo, switchTab, reLaunch, navigateBack, navigateToMiniProgram)
│   ├── device/       # 设备信息获取 (getDevice, getDeviceQuery, clearDeviceCache)
│   └── request/      # 全局网络请求 (request 单例, useUpload, BaseService 服务基类)
├── directives/       # 自定义指令 (vCopy 自动复制指令)
└── app.ts            # 应用根上下文入口 (useApp)
```

---

## 🎨 核心模块 (`core/`)

### 1. 主题与外观管理 — `useTheme()` / `initTheme()`

提供小程序应用及页面层级的主题、字号、字体风格动态刷新能力，并可自动根据主题深浅调整系统导航栏/状态栏前景色（如 `mono-theme` 与 `color-theme` 自动设为白色前景色）：

```vue
<script setup lang="ts">
import { useTheme } from "@hlw-mp/vue";

// 获取当前主题、字号类名、字体类名，以及设置函数
const { 
  theme, 
  fontSizeClass, 
  fontFamilyClass, 
  setFontSize, 
  setFontFamily 
} = useTheme();
</script>

<template>
  <!-- 将主题相关 CSS Class 应用于页面最外层容器 -->
  <hlw-page :class="[theme, fontSizeClass, fontFamilyClass]" title="主题设置">
    <view class="content">
      <text class="text-demo">当前正使用个性化外观配置</text>
      <button @tap="setFontSize('large')">放大字体</button>
    </view>
  </hlw-page>
</template>
```

在 `App.vue` 初始化阶段，可以使用 `initTheme()` 设定初始主题：

```ts
import { initTheme } from "@hlw-mp/vue";

onLaunch(() => {
  initTheme("mono-theme");
});
```

### 2. 交互式反馈 — `useMsg()` / 全局 `hlw.$msg`

封装并规整了小程序原生的 Toast、Loading 与 Promise 化的 Modal 确认弹窗。支持在 setup 内部使用 `useMsg()`，亦支持在非 setup 环境中通过全局 `hlw.$msg` 直接调用：

```ts
import { useMsg, hlw } from "@hlw-mp/vue";

const msg = useMsg();

// 1. Toast 轻提示
msg.toast("操作成功");
hlw.$msg.toast("非 setup 阶段直接调用");

msg.success("保存成功");
msg.error("提交失败");

// 2. Loading 等待框（带遮罩防穿透点击）
msg.showLoading("数据同步中...");
msg.hideLoading();

// 3. Promise 风格确认弹窗
const handleDelete = async () => {
  const confirm = await msg.confirm({
    title: "安全警告",
    content: "此操作将永久删除该资源，是否继续？",
    confirmColor: "#ef4444"
  });
  if (confirm) {
    // 执行删除操作
  }
};
```

### 3. 小程序页面分享 — `useShare()`

在 setup 中以声明式极简控制当前页面的微信转发卡片及朋友圈分享配置：

```vue
<script setup lang="ts">
import { useShare } from "@hlw-mp/vue";

// 声明分享配置，自动劫持当前页面的分享与朋友圈按钮事件
useShare({
  title: "推荐你体验这个超棒的小程序！",
  path: "/pages/index/index?from=share_button",
  imageUrl: "https://example.com/share-cover.png"
});
</script>
```

### 4. 动态模板 Ref 集合 — `useRefs()`

用于在 `v-for` 循环渲染中动态收集 DOM 节点或组件实例的 Ref 引用：

```vue
<script setup lang="ts">
import { useRefs } from "@hlw-mp/vue";

const { refs, setRef } = useRefs<any>();

const handleScroll = (index: number) => {
  const targetComponent = refs.value[index];
  if (targetComponent) {
    // 调用组件实例上的方法
    targetComponent.scrollIntoView();
  }
};
</script>

<template>
  <view v-for="(item, index) in list" :key="item.id">
    <custom-item :ref="el => setRef(el, index)" />
  </view>
</template>
```

---

## 🛠️ 纯无状态工具集 (`utils/`)

### 1. 路由与导航跳转 — `navigator`

全面接管 uni-app 原生路由 API，内置路由降级、安全异常捕获与失败自动提示。

```ts
import { 
  navigateTo, 
  redirectTo, 
  switchTab, 
  reLaunch, 
  navigateBack, 
  navigateToMiniProgram 
} from "@hlw-mp/vue";

// 保留当前页，跳转至指定路径
navigateTo("/pages/detail/index?id=123");

// 关闭当前页，重定向跳转
redirectTo("/pages/auth/login");

// 切换至 TabBAR 导航页
switchTab("/pages/home/index");

// 关闭所有页面，重启并打开指定页
reLaunch("/pages/index/index");

// 返回上级页面（默认 1 层）
navigateBack();
navigateBack(2); // 返回上两级页面

// 打开外部小程序
navigateToMiniProgram("wxxxxxxxxx", {
  path: "pages/main/index",
  envVersion: "release"
});
```

### 2. 网络请求封装 — `request` & `BaseService`

高性能的 HTTP 请求客户端，支持多拦截器链、自动携带设备头信息、对象服务化组织等。

```ts
import { request, BaseService, ServiceNamespace } from "@hlw-mp/vue";

// 1. 全局基础 URL 配置
request.setBaseURL("https://api.hlw.com");

// 2. 配置请求/响应拦截器
request.onRequest((config) => {
  config.headers = {
    ...config.headers,
    "Authorization": `Bearer ${useUserStore().token}`
  };
  return config;
});


// 3. 直接调用 API
const data = await request.get("/user/info");

// 4. 面向服务组织封装（基类配合装饰器）
@ServiceNamespace("order")
class OrderService extends BaseService {
  getList(page: number) {
    // 自动拼接为: /v1/order/list
    return this.get("/list", { page }); 
  }
}
export const orderService = new OrderService();
```

### 3. 微信广告控制助手 — `ad`

高度优化的插屏与激励视频广告助手，支持提前静默异步预加载、防止回调重叠、自动管理加载状态。

```ts
import { setAdPopup, showAdPopup, setAdReward, showAdReward } from "@hlw-mp/vue";

// 1. 插屏广告配置与延迟展示
setAdPopup("adunit-popup-xxxx");
await showAdPopup(2000); // 延迟 2000ms 自动展示已加载的插屏广告

// 2. 激励视频广告配置（完美支持 Promise 化播放状态响应）
setAdReward("adunit-reward-xxxx", (res) => {
  if (res.ok && res.isEnded) {
    // 成功播放完毕，在此分发业务奖励
  }
});

// 立即唤起激励视频广告播放
const res = await showAdReward(() => {
  // 广告拉起成功回调，可用于关闭页面的 Loading 等待框
});
```

### 4. 设备与系统元数据 — `device`

标准化、可缓存的高效设备元数据获取。消除了不同端、不同版本小程序获取系统属性的 API 碎片化问题。

```ts
import { getDevice, getDeviceQuery } from "@hlw-mp/vue";

// 获取标准化设备数据结构
const device = getDevice();
console.log(device.platform, device.device_brand, device.system);

// 获取已转化为 URL-encoded 参数的设备数据，常用于拼接到请求 Query 头中
const queryStr = getDeviceQuery();
```

### 5. 公共工具库 — `common`

包含系统剪贴板交互、支持权限预检测的多媒体资源（图片、视频）一键下载并保存到系统相册等实用工具。

```ts
import { 
  copy, 
  paste, 
  saveImageUrl, 
  saveVideoUrl, 
  toQuery, 
  withQuery 
} from "@hlw-mp/vue";

// 1. 剪贴板读取与写入
await copy("复制的内容", true); // 第二参数决定是否弹出“复制成功”提示
const text = await paste();

// 2. 保存网络多媒体资源至手机相册（自动拦截未授权状态，弹出引导设置提示）
const successImg = await saveImageUrl("https://img.hlw.com/logo.jpg");
const successVideo = await saveVideoUrl("https://img.hlw.com/video.mp4");

// 3. 安全 URL 参数拼接
const newUrl = withQuery("/pages/index", "id=1&name=hlw");
const query = toQuery({ id: 1, name: "hlw", temp: null }); // "id=1&name=hlw"
```

---

## ⚡ 自定义 Vue 指令 (`directives`)

### `v-copy` 点击复制指令

在模板标签上声明此指令，点击元素即可自动将绑定值复制到手机系统剪贴板，并触发微提示，无需绑定多余事件：

```vue
<template>
  <view class="user-info">
    <!-- 点击直接复制 ID 文本 -->
    <text v-copy="userId" class="uid-text">用户ID: {{ userId }}</text>
  </view>
</template>
```

---

## 📦 easycom UI 组件全景索引 (27个内置组件)

以下为 `@hlw-mp/vue` 内置的部分核心 UI 组件简表：

| 组件名称 | 目录定位 | 说明 |
| :--- | :--- | :--- |
| **`hlw-page`** | `components/hlw-page` | **核心页面骨架组件**。统一承载页面导航、滚动视图区与底部固定栏。 |
| **`hlw-button`** | `components/hlw-button` | **语义化增强按钮**。支持路由快捷绑定、状态机 loading 及小程序开放能力。 |
| **`hlw-paging`** | `components/hlw-paging` | **高性能分页滚动容器**。基于 z-paging 整合内置 loading 和空状态。 |
| **`hlw-header`** | `components/hlw-header` | **自定义沉浸式导航栏**。支持各类自定义动作、按钮与插槽。 |
| **`hlw-avatar`** | `components/hlw-avatar` | **增强用户头像**。图片加载失败时自动平滑降级显示文字首字母。 |
| **`hlw-skeleton`** | `components/hlw-skeleton` | **渐变骨架占位屏**。带优雅扫光动画效果的 UI 占位图。 |
| **`hlw-loading`** | `components/hlw-loading` | **组件级加载指示器**。统一的高品质微动效 loading。 |
| **`hlw-empty`** | `components/hlw-empty` | **通用空状态面板**。内置优雅插图，支持各种状态文案定制。 |
| **`hlw-popup`** | `components/hlw-popup` | **弹窗基类容器**。支持上、下、中等各种动画过渡的全局蒙层容器。 |
| **`hlw-tabs`** | `components/hlw-tabs` | **滚动标签页选项卡**。自动平滑计算高亮下滑线位置。 |
| **`hlw-tag`** | `components/hlw-tag` | **语义标签组件**。内置多种主题颜色、胶囊型及镂空风格。 |

---

## 💻 团队本地开发说明

若您需要参与本组件库的修改、维护与新特性迭代，请遵循以下工程流程：

### 1. 启动热编译 (Watch Mode)

```bash
pnpm dev
```
此时 Vite 将启动监听构建，自动将 `src/` 的变更即时打包同步至 `dist/` 临时构建目录，使本地消费链路保持实时更新。

### 2. 生成生产级分发包

在合并主分支或发版前，须执行生产级打包编译，产出经高度优化、体积极致压缩且带全量类型定义的包产物：

```bash
pnpm build
```

---

## 📄 许可声明

本仓库为**内部私有组件库**。仅授权应用于 `hlw-uni` 关联小程序的协作与业务研发。未经许可，严禁分发或公开上传至公共 NPM 仓库或共享平台。
