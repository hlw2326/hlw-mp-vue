<template>
    <!-- 浮动触发按钮，未激活时显示 -->
    <view
        v-if="!active"
        class="trigger"
        hover-class="trigger--hover"
        @tap="onEnter"
    >
        <span class="i-fa6-solid-pen-nib trigger-icon" />
    </view>

    <!-- 全屏批注层，激活时覆盖整个页面（含 hlw-header） -->
    <view v-if="active" class="overlay">
        <canvas
            id="hlw-canvas-el"
            type="2d"
            class="canvas"
            :class="{ 'canvas--passthrough': scrollMode }"
            :disable-scroll="!scrollMode"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
        />

        <!-- 顶部状态条：左关闭，右模式切换（避开右上角微信胶囊） -->
        <view class="bar">
            <view class="bar-close" hover-class="bar-close--hover" @tap="onExit">
                <span class="i-fa6-solid-xmark bar-icon" />
            </view>
            <view
                class="bar-toggle"
                :class="{ 'bar-toggle--on': scrollMode }"
                hover-class="bar-toggle--hover"
                @tap="scrollMode = !scrollMode"
            >
                <span :class="[scrollMode ? 'i-ri-arrow-up-down-line' : 'i-ri-pencil-line', 'bar-icon']" />
                <text class="bar-toggle-text">{{ scrollMode ? "滚动" : "绘画" }}</text>
            </view>
        </view>

        <!-- 底部工具坞 -->
        <view class="dock">
            <!-- 模式：笔 / 圈 / 方 / 移动 -->
            <view class="modes">
                <view
                    v-for="modeItem in MODES"
                    :key="modeItem.value"
                    class="mode"
                    :class="{ 'mode--active': modeItem.value === mode }"
                    hover-class="mode--hover"
                    @tap="mode = modeItem.value"
                >
                    <span :class="modeItem.icon" class="mode-icon" />
                </view>
            </view>

            <!-- 工具行：颜色 / 笔粗 / 撤销清空 -->
            <view class="tools">
                <view class="colors">
                    <view
                        v-for="colorItem in COLORS"
                        :key="colorItem"
                        class="color"
                        :class="{ 'color--active': colorItem === color }"
                        :style="{ background: colorItem }"
                        @tap="color = colorItem"
                    >
                        <span v-if="colorItem === color" class="i-fa6-solid-check color-check" />
                    </view>
                </view>

                <view class="sizes">
                    <view
                        v-for="sizeItem in SIZES"
                        :key="sizeItem.value"
                        class="size"
                        :class="{ 'size--active': sizeItem.value === lineWidth }"
                        @tap="lineWidth = sizeItem.value"
                    >
                        <view
                            class="size-dot"
                            :style="{
                                width: sizeItem.value * 2 + 'rpx',
                                height: sizeItem.value * 2 + 'rpx',
                                background: color,
                            }"
                        />
                    </view>
                </view>

                <view class="actions">
                    <view class="action" hover-class="action--hover" @tap="onUndo">
                        <span class="i-ri-arrow-go-back-line action-icon" />
                    </view>
                    <view class="action" hover-class="action--hover" @tap="onClear">
                        <span class="i-fa6-solid-trash-can action-icon" />
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
/**
 * HlwCanvas — 全屏批注画板
 *
 * 嵌在 <hlw-page> 内时全自动：
 *   - 浮动 ✏️ 按钮触发进入批注
 *   - 笔 / 圈 / 方 / 移动 4 种模式 + 5 色 + 3 档粗细
 *   - 滚动模式下 canvas 透传触摸，页面正常滚；笔画跟随 hlw-page 的 scrollTop 滚动定位
 *   - 撤销 / 清空
 *
 * @example 自动模式（嵌在 hlw-page 内）
 * ```vue
 * <hlw-page>
 *   <view>...内容...</view>
 * </hlw-page>
 * <hlw-board v-model:active="boardActive" />
 * <!-- 注意：必须挂在 hlw-page 同级（page 根级），否则 fixed 盖不住 hlw-header -->
 * ```
 */
import { ref, nextTick, getCurrentInstance, inject, watch, type Ref } from "vue";

type Mode = "pen" | "ellipse" | "rect" | "move";

interface PageScrollContext {
    scrollTop: Ref<number>;
    scrollToTop: () => void;
}

interface BaseStroke {
    color: string;
    width: number;
}
interface PenStroke extends BaseStroke {
    type: "pen";
    points: Array<{ x: number; y: number }>;
}
interface ShapeStroke extends BaseStroke {
    type: "ellipse" | "rect";
    x: number;
    y: number;
    w: number;
    h: number;
}
type Stroke = PenStroke | ShapeStroke;

const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#1e293b"];
const SIZES = [
    { label: "细", value: 4 },
    { label: "中", value: 8 },
    { label: "粗", value: 14 },
];
const MODES: Array<{ value: Mode; icon: string }> = [
    { value: "pen", icon: "i-ri-pencil-line" },
    { value: "ellipse", icon: "i-ri-circle-line" },
    { value: "rect", icon: "i-ri-square-line" },
    { value: "move", icon: "i-ri-drag-move-line" },
];

const active = defineModel<boolean>("active", { default: false });
const color = ref(COLORS[0]);
const lineWidth = ref(SIZES[0].value);
const mode = ref<Mode>("pen");
const strokes = ref<Stroke[]>([]);
const scrollMode = ref(false);

const pageCtx = inject<PageScrollContext | null>("hlwPageScroll", null);

function getScrollTop() {
    return pageCtx?.scrollTop.value ?? 0;
}

watch(
    () => pageCtx?.scrollTop.value,
    () => {
        if (active.value && ctx) redraw();
    },
);

let canvas: any = null;
let ctx: any = null;
let drawing = false;
let currentPoints: Array<{ x: number; y: number }> = [];
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let dragIndex = -1;
let dragOffsetX = 0;
let dragOffsetY = 0;

const instance = getCurrentInstance();

function onEnter() {
    active.value = true;
    nextTick(() => initCanvas());
}

function onExit() {
    active.value = false;
    scrollMode.value = false;
    strokes.value = [];
    canvas = null;
    ctx = null;
}

function initCanvas() {
    if (!instance?.proxy) return;
    uni
        .createSelectorQuery()
        .in(instance.proxy)
        .select("#hlw-canvas-el")
        .fields({ node: true, size: true }, (res: any) => {
            const node = res?.node;
            if (!node) return;
            const dpr = uni.getSystemInfoSync().pixelRatio;
            node.width = res.width * dpr;
            node.height = res.height * dpr;
            const context = node.getContext("2d");
            context.scale(dpr, dpr);
            canvas = node;
            ctx = context;
        })
        .exec();
}

function applyPenStyle(strokeColor: string, width: number) {
    if (!ctx) return;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
}

function renderStroke(strokeItem: Stroke) {
    if (!ctx) return;
    applyPenStyle(strokeItem.color, strokeItem.width);
    // 笔画存的是页面坐标，渲染时减掉当前 scrollTop 转回视口坐标
    const dy = -getScrollTop();
    if (strokeItem.type === "pen") {
        ctx.beginPath();
        strokeItem.points.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y + dy);
            else ctx.lineTo(point.x, point.y + dy);
        });
        ctx.stroke();
    } else if (strokeItem.type === "ellipse") {
        const cx = strokeItem.x + strokeItem.w / 2;
        const cy = strokeItem.y + strokeItem.h / 2 + dy;
        ctx.beginPath();
        ctx.ellipse(cx, cy, strokeItem.w / 2, strokeItem.h / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
    } else if (strokeItem.type === "rect") {
        ctx.strokeRect(strokeItem.x, strokeItem.y + dy, strokeItem.w, strokeItem.h);
    }
}

function redraw() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const strokeItem of strokes.value) renderStroke(strokeItem);
}

function previewShape() {
    if (!ctx) return;
    redraw();
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(currentX - startX);
    const h = Math.abs(currentY - startY);
    renderStroke({
        type: mode.value as "ellipse" | "rect",
        color: color.value,
        width: lineWidth.value,
        x,
        y,
        w,
        h,
    });
}

/** 点 (px, py) 是否在某个形状内；返回最上层（数组末尾优先）的索引，没命中返回 -1。pen 笔画跳过。 */
function hitTest(px: number, py: number): number {
    for (let index = strokes.value.length - 1; index >= 0; index--) {
        const strokeItem = strokes.value[index];
        if (strokeItem.type === "rect") {
            if (px >= strokeItem.x && px <= strokeItem.x + strokeItem.w && py >= strokeItem.y && py <= strokeItem.y + strokeItem.h) return index;
        } else if (strokeItem.type === "ellipse") {
            const rx = strokeItem.w / 2;
            const ry = strokeItem.h / 2;
            if (rx <= 0 || ry <= 0) continue;
            const nx = (px - (strokeItem.x + rx)) / rx;
            const ny = (py - (strokeItem.y + ry)) / ry;
            if (nx * nx + ny * ny <= 1) return index;
        }
    }
    return -1;
}

function onTouchStart(event: any) {
    if (!ctx) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    const px = touch.x;
    const py = touch.y + getScrollTop();

    if (mode.value === "move") {
        const idx = hitTest(px, py);
        if (idx < 0) return;
        const strokeItem = strokes.value[idx] as ShapeStroke;
        dragIndex = idx;
        dragOffsetX = px - strokeItem.x;
        dragOffsetY = py - strokeItem.y;
        drawing = true;
        return;
    }

    drawing = true;
    startX = currentX = px;
    startY = currentY = py;

    if (mode.value === "pen") {
        currentPoints = [{ x: px, y: py }];
        applyPenStyle(color.value, lineWidth.value);
        ctx.beginPath();
        ctx.moveTo(touch.x, touch.y);
    }
}

function onTouchMove(event: any) {
    if (!drawing || !ctx) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    const px = touch.x;
    const py = touch.y + getScrollTop();

    if (mode.value === "move") {
        if (dragIndex < 0) return;
        const strokeItem = strokes.value[dragIndex] as ShapeStroke;
        strokeItem.x = px - dragOffsetX;
        strokeItem.y = py - dragOffsetY;
        redraw();
        return;
    }

    if (mode.value === "pen") {
        ctx.lineTo(touch.x, touch.y);
        ctx.stroke();
        currentPoints.push({ x: px, y: py });
        return;
    }

    currentX = px;
    currentY = py;
    previewShape();
}

function onTouchEnd() {
    if (!drawing) return;
    drawing = false;

    if (mode.value === "move") {
        dragIndex = -1;
        return;
    }

    if (mode.value === "pen") {
        if (currentPoints.length > 0) {
            strokes.value.push({
                type: "pen",
                color: color.value,
                width: lineWidth.value,
                points: [...currentPoints],
            });
        }
        currentPoints = [];
        return;
    }

    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(currentX - startX);
    const h = Math.abs(currentY - startY);
    if (w >= 4 || h >= 4) {
        strokes.value.push({
            type: mode.value as "ellipse" | "rect",
            color: color.value,
            width: lineWidth.value,
            x,
            y,
            w,
            h,
        });
    } else {
        redraw();
    }
}

function onUndo() {
    if (strokes.value.length === 0) return;
    strokes.value.pop();
    redraw();
}

function onClear() {
    if (strokes.value.length === 0) return;
    strokes.value = [];
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

defineOptions({
    name: "HlwCanvas",
    options: {
        styleIsolation: "shared",
        virtualHost: true,
    },
});
</script>

<style scoped lang="scss">
/* 内部字号、尺寸全部用固定 rpx，不跟随主题字体档位变化（批注 UI 需要稳定布局） */

/* 浮动触发按钮 */
.trigger {
    position: fixed;
    right: 32rpx;
    bottom: 40rpx;
    z-index: 100;
    width: 66rpx;
    height: 66rpx;
    background: rgba(248, 250, 252, 0.96);
    color: #64748b;
    border-radius: 50%;
    border: 1rpx solid rgba(148, 163, 184, 0.32);
    display: flex;
    align-items: center;
    justify-content: center;
}

.trigger--hover {
    transform: scale(0.95);
    opacity: 0.9;
}

.trigger-icon {
    font-size: 24rpx;
}

/* 全屏覆盖层 */
.overlay {
    position: fixed;
    inset: 0;
    z-index: 9000;
    pointer-events: none;
}

.canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
    background: rgba(15, 23, 42, 0.04);
}

.canvas--passthrough {
    pointer-events: none;
    background: transparent;
}

/* 顶部状态条 */
.bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 100rpx 32rpx 16rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    pointer-events: auto;
    background: linear-gradient(to bottom, rgba(15, 23, 42, 0.6), transparent);
}

.bar-close {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    color: #1e293b;
    border-radius: 50%;
    font-size: 22rpx;
    box-shadow: 0 2rpx 8rpx rgba(15, 23, 42, 0.12);
}

.bar-icon {
    font-weight: 400;
}

.bar-close--hover {
    transform: scale(0.92);
    background: #ffffff;
}

.bar-toggle {
    display: flex;
    align-items: center;
    gap: 8rpx;
    height: 48rpx;
    padding: 0 18rpx;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.95);
    border-radius: var(--radius-full);
    color: #1e293b;
    font-size: 22rpx;
    font-weight: 400;
    box-shadow: 0 2rpx 8rpx rgba(15, 23, 42, 0.12);
}

.bar-toggle--on {
    background: #fef3c7;
    color: #b45309;
}

.bar-toggle--hover {
    opacity: 0.85;
}

.bar-toggle-text {
    letter-spacing: 1rpx;
    font-size: 22rpx;
    font-weight: 400;
}

/* 底部工具坞 */
.dock {
    position: absolute;
    left: 32rpx;
    right: 32rpx;
    bottom: 50rpx;
    padding: 16rpx 26rpx;
    background: rgba(255, 255, 255, 0.96);
    border-radius: 16rpx;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    pointer-events: auto;
}

/* 模式行 */
.modes {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    padding-bottom: 12rpx;
    border-bottom: 1rpx solid rgba(15, 23, 42, 0.08);
}

.mode {
    flex: 1;
    height: 52rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    background: #f8fafc;
    color: var(--text-secondary);
    font-size: 22rpx;
}

.mode--hover {
    opacity: 0.85;
}

.mode--active {
    background: #e2e8f0;
    color: #1e293b;
}

.mode-icon {
    font-size: 26rpx;
}

/* 工具行 */
.tools {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10rpx;
}

.colors {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.color {
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    border: 2rpx solid rgba(15, 23, 42, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease;
}

.color--active {
    transform: scale(1.2);
    box-shadow: 0 0 0 2rpx #ffffff, 0 0 0 4rpx #1e293b, 0 4rpx 8rpx rgba(15, 23, 42, 0.2);
}

.color-check {
    color: #ffffff;
    font-size: 18rpx;
    font-weight: 700;
}

.sizes {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 0 16rpx;
    border-left: 1rpx solid rgba(15, 23, 42, 0.08);
    border-right: 1rpx solid rgba(15, 23, 42, 0.08);
}

.size {
    width: 36rpx;
    height: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.size--active {
    background: #f8fafc;
    box-shadow: inset 0 0 0 2rpx #1e293b;
}

.size-dot {
    border-radius: 50%;
    transition: all 0.15s ease;
}

.actions {
    display: flex;
    align-items: center;
    gap: 14rpx;
}

.action {
    width: 44rpx;
    height: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    color: var(--text-secondary);
    border-radius: 50%;
    font-size: 22rpx;
}

.action--hover {
    background: #e2e8f0;
}

.action-icon {
    font-size: 18rpx;
}
</style>
