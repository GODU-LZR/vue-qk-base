import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { registerMicroApps, start } from 'qiankun';
import microApps from './micro/apps';

Vue.use(ElementUI);
Vue.config.productionTip = false;

let app = null;

// 首先渲染基座应用
app = new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');

// 等待基座应用完全挂载后，再注册微应用
app.$nextTick(() => {
  // 注册微应用
  registerMicroApps(microApps, {
    beforeLoad: app => {
      console.log('[主应用] 加载前', app.name);
      return Promise.resolve();
    },
    afterMount: app => {
      console.log('[主应用] 挂载后', app.name);
      return Promise.resolve();
    }
  });

  // 启动 qiankun
  start({
    prefetch: 'all',
    singular: true,  // 允许多个子应用同时挂载
    sandbox: {
      strictStyleIsolation: false, // 严格的样式隔离（Shadow DOM）
      experimentalStyleIsolation: true, // 实验性的样式隔离
    }
  });
});
