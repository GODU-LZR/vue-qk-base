// vue-qk-base/vue.config.js
const { defineConfig } = require('@vue/cli-service')
const path = require('path'); // 导入 Node.js 的 path 模块

module.exports = defineConfig({
  // 添加 runtimeCompiler 选项
  runtimeCompiler: true,
  transpileDependencies: true,
  publicPath: '/', // 主应用部署在根路径
  devServer: {
    port: 3000, // 或者您想要的其他端口
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
    // historyApiFallback: true // 如果使用 history 模式可选
  },

  // --- 添加 configureWebpack 部分 ---
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src') // 明确设置 @ 指向 src 目录
      }
    }
  }
})