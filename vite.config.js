import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import DefineOptions from 'unplugin-vue-define-options/vite';
 
export default defineConfig({
  base: '/fund/',
  plugins: [
    vue(),
    DefineOptions() // 如果需要支持旧的Options API语法糖特性，可以启用这个插件
  ],
  build: {
    outDir: 'dist', // 构建输出目录
    assetsDir: 'assets', // 静态资源目录
    minify: 'terser', // 压缩方式
    sourcemap: false, // 是否生成sourcemap
    terserOptions: {
      compress: {
        drop_console: true, // 移除console
        drop_debugger: true, // 移除debugger
        pure_funcs: ['console.log', 'console.debug', 'console.warn'] // 移除指定的函数调用
      }
    },
    chunkSizeWarningLimit: 2000, // 调整chunk大小警告限制
    // 移除代码分割配置，打包成一个文件
    rollupOptions: {
      output: {
        manualChunks: undefined // 不进行代码分割
      }
    }
  }
});