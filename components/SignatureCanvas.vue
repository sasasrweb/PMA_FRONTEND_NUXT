<!-- components/SignatureCanvas.vue -->
<template>
  <div class="border rounded-md overflow-hidden">
    <canvas
      ref="canvasRef"
      class="w-full h-48 touch-none"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
      @touchstart.prevent="startDrawing"
      @touchmove.prevent="draw"
      @touchend.prevent="stopDrawing"
    ></canvas>
    <div class="p-2">
      <button
        type="button"
        class="text-sm text-red-600 underline"
        @click="clearCanvas"
      >
        Clear Signature
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref(false);
let ctx: CanvasRenderingContext2D | null = null;

onMounted(() => {
  if (canvasRef.value) {
    const canvas = canvasRef.value;
    ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";
    }
  }
});

const startDrawing = (e: MouseEvent | TouchEvent) => {
  isDrawing.value = true;
  draw(e);
};

const stopDrawing = () => {
  isDrawing.value = false;
  ctx?.beginPath();
};

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !ctx) return;

  let x: number, y: number;

  if (e instanceof TouchEvent) {
    const rect = canvasRef.value?.getBoundingClientRect();
    const touch = e.touches[0];
    if (rect) {
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    }
  } else {
    x = e.offsetX;
    y = e.offsetY;
  }

  ctx.lineTo(x!, y!);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x!, y!);
};

const clearCanvas = () => {
  if (ctx && canvasRef.value) {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
};

const toDataURL = () => {
  return canvasRef.value?.toDataURL("image/png") || "";
};

const isEmpty = () => {
  if (!ctx || !canvasRef.value) return true;
  const blank = document.createElement("canvas");
  blank.width = canvasRef.value.width;
  blank.height = canvasRef.value.height;
  return canvasRef.value.toDataURL() === blank.toDataURL();
};

defineExpose({ toDataURL, isEmpty, clearCanvas });
</script>
