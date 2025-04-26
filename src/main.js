// src/main.js (主应用)

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store'; // 假设你有 Vuex store
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// 1. 导入 qiankun 相关函数
import { registerMicroApps, start, initGlobalState } from 'qiankun';
import microApps from './micro/apps';

// 2. 导入认证工具函数 (使用你确认的正确路径!)
import {
  isTokenValid,
  parseToken,
  getCurrentUser // getCurrentUser 内部调用 parseToken
} from '@/api/modules/auth/index.js'; // 确保路径正确且函数已导出

// 3. 导入我们创建的 actions 初始化函数
import { initActions } from '@/qiankun/actions';

Vue.use(ElementUI);
Vue.config.productionTip = false;

// --- 初始化 Qiankun 全局状态 ---

// 4. 获取初始状态
const initialToken = localStorage.getItem('auth_token');
const initialIsLoggedIn = isTokenValid(); // 直接调用 isTokenValid 获取布尔值
let initialUserInfo = null;
if (initialIsLoggedIn && initialToken) {
  // 优先使用 getCurrentUser，它封装了 parseToken 和 null 检查
  initialUserInfo = getCurrentUser();
}

const initialState = {
  isLoggedIn: initialIsLoggedIn,
  token: initialToken,
  userInfo: initialUserInfo,
  // 你可以根据需要添加其他全局状态
};
console.log('[主应用 main.js] 初始化全局状态:', initialState);

// 5. 调用 initGlobalState 并初始化共享的 actions
const actions = initGlobalState(initialState);
initActions(actions); // 将 qiankun 返回的 actions 存入共享模块

// 6. (可选) 在主应用监听全局状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('[主应用 main.js] 全局状态改变 (onGlobalStateChange):', state);
  // 如果主应用也需要根据状态更新 UI (例如通过 Vuex)
  // store.dispatch('user/updateUserState', state); // 示例：调用 Vuex action
});

// 7. 添加 storage 事件监听器
window.addEventListener('storage', (event) => {
  if (event.key === 'auth_token') {
    console.log('[主应用 main.js] Storage 事件触发 (auth_token):', event.newValue ? '设置/更新' : '清除');
    const newToken = event.newValue;
    const newIsLoggedIn = isTokenValid(); // isTokenValid 会自动读取 localStorage 最新的 token
    let newUserInfo = null;
    if (newIsLoggedIn && newToken) {
      newUserInfo = parseToken(newToken); // 这里需要用 parseToken 解析新的 token
    }

    console.log('[主应用 main.js] Storage 事件 - 更新全局状态:', { newIsLoggedIn, token: newToken ? '***' : null, newUserInfo });

    // 使用 setGlobalState 更新全局状态，通知所有子应用和主应用自身监听器
    actions.setGlobalState({
      isLoggedIn: newIsLoggedIn,
      token: newToken,
      userInfo: newUserInfo,
    });
  }
});

// --- Qiankun 配置结束 ---

let app = null; // 将 app 声明移到这里

// 首先渲染基座应用
app = new Vue({
  router,
  store, // 注入 store
  render: h => h(App),
}).$mount('#app');

// 等待基座应用完全挂载后，再注册微应用
app.$nextTick(() => {
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

  start({
    prefetch: 'all',
    singular: true,
    sandbox: {
      strictStyleIsolation: false,
      experimentalStyleIsolation: true,
    }
  });
});