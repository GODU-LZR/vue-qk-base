// vue-qk-base/vue.config.js
const { defineConfig } = require('@vue/cli-service')

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
  }
})
