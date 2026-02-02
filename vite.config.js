import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import DefineOptions from 'unplugin-vue-define-options/vite';
 
export default defineConfig({
  plugins: [
    vue(),
    DefineOptions() // 如果需要支持旧的Options API语法糖特性，可以启用这个插件
  ],
  build: {
    lib: {
      // entry: 'src/components/index.js', // 指定组件库入口文件
      entry: {
        ComponentA: './src/components/A/index.js', // 或对应的 Vue/React 文件
        ComponentB: './src/components/B/index.js',
      },
      name: 'MyVueComponents', // 打包后的库名
      fileName: (format) => `my-vue-test.${format}.js` // 指定输出文件名格式
    },
    rollupOptions: {
      // 确保外部化那些你的库依赖的 peerDependencies，这样库的用户可以在使用你的库的时候引入这些 peerDependencies
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});