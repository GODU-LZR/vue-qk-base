// src/main.js (主应用 - Base Application) - Final Attempt

import Vue from 'vue';
import App from './App.vue';
import router from './router'; // <--- 确保导入了 router 实例
import store from './store'; // 假设你有 Vuex store
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// 1. 导入 qiankun 相关函数
import { registerMicroApps, start, initGlobalState } from 'qiankun';
import microApps from './micro/apps';

// 2. 导入认证工具函数 (确保它们内部也使用 'auth_token')
import {
  isTokenValid,
  parseToken,
  getCurrentUser
} from '@/api/modules/auth/index.js';

// 3. 导入 actions 初始化函数
import { initActions } from '@/qiankun/actions';

Vue.use(ElementUI);
Vue.config.productionTip = false;

// --- 初始化 Qiankun 全局状态 ---

// 4. 获取初始状态 (确保使用 'auth_token')
const initialToken = localStorage.getItem('auth_token'); // <--- 统一 Key
const initialIsLoggedIn = isTokenValid(); // 确认 isTokenValid 内部使用 'auth_token'
let initialUserInfo = null;
if (initialIsLoggedIn && initialToken) {
  initialUserInfo = getCurrentUser(); // 确认 getCurrentUser 内部使用 'auth_token'
}

const initialState = {
  isLoggedIn: initialIsLoggedIn,
  token: initialToken,
  userInfo: initialUserInfo,
};
console.log('[主应用 main.js] 初始化全局状态:', JSON.stringify(initialState));

// 5. 调用 initGlobalState 获取原始 actions 对象
const originalActions = initGlobalState(initialState); // 使用新变量名以示区分
console.log('[主应用 main.js] initGlobalState 返回的原始 actions 对象:', originalActions); // 打印原始对象

// 6. --- 关键调整：先在【原始 actions 对象】上注册监听器 ---
originalActions.onGlobalStateChange((state, prev) => {
  // --- !! 日志 1: 确认监听器触发和状态值 !! ---
  console.log('[主应用 main.js] ============ onGlobalStateChange 触发 (在原始 actions 上注册) ============');
  console.log('   新状态 (state):', JSON.stringify(state));
  console.log('   旧状态 (prev):', JSON.stringify(prev));
  console.log(`   类型检查: prev.isLoggedIn (${typeof prev.isLoggedIn}), state.isLoggedIn (${typeof state.isLoggedIn})`);

  const shouldLogout = prev.isLoggedIn === true && state.isLoggedIn === false;
  // --- !! 日志 2: 打印判断结果 !! ---
  console.log(`[主应用 main.js] 判断是否需要执行登出逻辑 (prev.isLoggedIn === true && state.isLoggedIn === false): ${shouldLogout}`);

  if (shouldLogout) {
    // --- !! 日志 3: 确认进入登出处理逻辑 !! ---
    console.log('[主应用 main.js] !!! 检测到登出条件满足，开始执行清理和重定向 !!!');

    // 1. 清理本地存储 (使用 'auth_token')
    console.log('[主应用 main.js] 步骤 1: 即将清理 localStorage...');
    localStorage.removeItem('auth_token'); // <--- 统一 Key
    localStorage.removeItem('userInfo');
    localStorage.setItem('isLoggedIn', 'false');
    // --- !! 日志 4: 确认 localStorage 清理完成 !! ---
    console.log('[主应用 main.js] localStorage 清理完成.');
    // --- !! 日志 5: 立即检查 localStorage 状态 !! ---
    console.log('    >>> 检查 localStorage (清理后): auth_token=', localStorage.getItem('auth_token'), ' userInfo=', localStorage.getItem('userInfo'), ' isLoggedIn=', localStorage.getItem('isLoggedIn'));

    // 2. (可选) 清理主应用的 Vuex/Pinia 状态
    // store.dispatch('user/logoutAction');

    // 3. 使用 router 实例进行跳转到登录页 (添加 $nextTick)
    // --- !! 日志 6: 确认准备执行跳转 !! ---
    console.log('[主应用 main.js] 步骤 3: 即将调用 Vue.nextTick 进行路由跳转...');
    Vue.nextTick(() => {
      // --- !! 日志 7: 确认进入 $nextTick 回调 !! ---
      console.log('[主应用 main.js] ($nextTick) 开始执行跳转逻辑...');
      // --- !! 日志 8: 打印当前路由 !! ---
      const currentPath = router.currentRoute.path;
      console.log(`[主应用 main.js] ($nextTick) 当前路由路径是: ${currentPath}`);
      if (currentPath !== '/login') {
        // --- !! 日志 9: 确认调用 router.replace !! ---
        console.log(`[主应用 main.js] ($nextTick) 调用 router.replace('/login')...`);
        router.replace('/login').catch(err => {
          if (err.name !== 'NavigationDuplicated' && !err.message.includes('Redirected when going from')) {
            console.error('[主应用 main.js] ($nextTick) 登出重定向到 /login 时发生错误:', err);
          } else {
            console.log('[主应用 main.js] ($nextTick) 登出重定向被阻止 (可能已在跳转中或目标相同).');
          }
        });
        // --- !! 日志 10: 确认 router.replace 调用结束 !! ---
        console.log('[主应用 main.js] ($nextTick) router.replace(\'/login\') 已调用.');
      } else {
        // --- !! 日志 11: 确认已在登录页 !! ---
        console.log('[主应用 main.js] ($nextTick) 已在 /login, 无需跳转.');
      }
    });
    // --- 登出处理结束 ---

  } else {
    // --- !! 日志 12: 确认未进入登出逻辑 !! ---
    console.log('[主应用 main.js] 未满足登出条件或非登出状态变化，主应用监听器不执行 localStorage 同步或跳转。');
    // 对于非登出状态的变化，主应用不再主动同步 localStorage
  }
  console.log('[主应用 main.js] ============ onGlobalStateChange 结束 ============');
});
// --- !! 日志: 确认监听器已注册 !! ---
console.log('[主应用 main.js] onGlobalStateChange 监听器已在 actions 对象上注册 (在 initActions 之前)。 typeof onGlobalStateChange:', typeof originalActions.onGlobalStateChange);


// --- !! 关键调整：现在才调用 initActions !! ---
initActions(originalActions); // 将【原始】的 actions 对象传递给 initActions


// 7. 添加 storage 事件监听器 (确保也使用正确的 key 'auth_token')
window.addEventListener('storage', (event) => {
  if (event.key === 'auth_token') { // <--- 统一 Key
    console.log('[主应用 main.js] Storage 事件触发 (auth_token):', event.newValue ? '设置/更新' : '清除');
    const newToken = event.newValue;
    const newIsLoggedIn = isTokenValid(); // 确认 isTokenValid 内部使用 'auth_token'
    let newUserInfo = null;
    if (newIsLoggedIn && newToken) {
      newUserInfo = parseToken(newToken); // 确认 parseToken 内部使用的 key
    }
    console.log('[主应用 main.js] Storage 事件 - 更新全局状态:', { newIsLoggedIn, token: newToken ? '***' : null, newUserInfo });
    // --- !! 关键：仍然使用原始的 originalActions 来设置状态，以确保一致性 !! ---
    originalActions.setGlobalState({
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
  router, // 确保 router 实例传递给 Vue
  store,  // 注入 store
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
    // beforeUnmount, afterUnmount 等生命周期按需添加
  });

  // 启动 Qiankun
  start({
    prefetch: 'all', // 预加载所有子应用静态资源
    singular: true,  // 单例模式，同一时间只展示一个子应用
    sandbox: {
      strictStyleIsolation: false, // 关闭严格样式隔离 (scope css)
      experimentalStyleIsolation: true, // 启用实验性样式隔离 (shadow dom) - 根据需要调整
    }
    // fetch: (url, ...args) => window.fetch(url, ...args), // 可选：自定义 fetch
  });
});