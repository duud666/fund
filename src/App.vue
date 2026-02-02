<script setup>
import Test from './components/Test/index.vue'
</script>

<template>
  <div class="wrap">
    <Test/>
  </div>
</template>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.wrap {
  width: 100%;
  min-height: 100vh;
}
</style>

