// src/main.js
import Vue from 'vue'
import App from './App.vue'
//路由
import router from './router'
// ElementUI
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { registerQiankun } from './micro'

Vue.use(ElementUI);
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

// 注册并启动 qiankun
registerQiankun()
