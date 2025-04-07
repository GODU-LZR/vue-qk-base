import Vue from 'vue';
import Router from 'vue-router';
// --- 引入 Element UI 的 Message 组件 ---
import { Message } from 'element-ui'; // 确保你已经安装并正确配置了 Element UI
import LoginView from '../views/auth/LoginView.vue'; // 确认路径正确
import RegisterView from '../views/auth/RegisterView.vue'; // 确认路径正确
import { isTokenValid } from '@/api/modules/auth'; // 确认路径正确

Vue.use(Router);

// 创建默认首页组件 (保持不变)
const HomePage = {
  name: 'HomePage',
  template: `
    <div class="home-container">
      <h2>体育管理系统欢迎您</h2>
      <p>您可以通过左侧菜单访问各个子应用</p>
    </div>
  `
};

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { title: '首页', requiresAuth: true } // 标记首页需要登录
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { title: '注册' }
  },
  // --- 其他子应用路由 (假设都需要登录) ---
  { path: '/posts', name: 'Posts', component: { template: '<div>帖子子应用路由激活时加载</div>' }, meta: { title: '体育论坛', requiresAuth: true } },
  { path: '/assistant', name: 'Assistant', component: { template: '<div>智能助理子应用路由激活时加载</div>' }, meta: { title: '智能助理', requiresAuth: true } },
  { path: '/user', name: 'User', component: { template: '<div>用户信息子应用路由激活时加载</div>' }, meta: { title: '用户信息', requiresAuth: true } },
  { path: '/venue', name: 'Venue', component: { template: '<div>体育场地子应用路由激活时加载</div>' }, meta: { title: '体育场地', requiresAuth: true } },
  { path: '/equipment', name: 'Equipment', component: { template: '<div>体育器材子应用路由激活时加载</div>' }, meta: { title: '体育器材', requiresAuth: true } },
  { path: '/events', name: 'Events', component: { template: '<div>体育赛事子应用路由激活时加载</div>' }, meta: { title: '体育赛事', requiresAuth: true } },
  { path: '/finance', name: 'Finance', component: { template: '<div>体育开支子应用路由激活时加载</div>' }, meta: { title: '体育开支', requiresAuth: true } },
  { path: '/hr', name: 'HR', component: { template: '<div>体育人事子应用路由激活时加载</div>' }, meta: { title: '体育人事', requiresAuth: true } },
  // --- 通配符路由 ---
  // 通常用于 qiankun 等微前端场景，确保路径存在，由 qiankun 决定加载哪个子应用或显示 404
  { path: '*', component: { template: '<div id="subapp-catchall">子应用容器或404</div>' } }
];

// 处理 NavigationDuplicated 错误 (保持不变)
// 这是为了防止直接调用 router.push/replace 到相同路由时控制台报错
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch(err => {
    // 捕获 NavigationDuplicated 或 Redirected 错误，避免它们成为未处理的 Promise rejection
    if (err.name !== 'NavigationDuplicated' && !err.message.includes('Redirected when going from')) {
      // 重新抛出其他类型的错误
      throw err;
    }
    // 对于 NavigationDuplicated 和 Redirected，静默处理或仅警告
    // console.warn('Navigation prevented in push:', err.message);
  });
};
const originalReplace = Router.prototype.replace;
Router.prototype.replace = function replace(location, onResolve, onReject) {
  if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject);
  return originalReplace.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated' && !err.message.includes('Redirected when going from')) {
      throw err;
    }
    // console.warn('Navigation prevented in replace:', err.message);
  });
};


// 创建 Router 实例
const router = new Router({
  mode: 'history',
  base: '/', // 或者 process.env.BASE_URL
  routes,
});

// --- 全局前置守卫 ---
router.beforeEach((to, from, next) => {
  const loggedIn = isTokenValid();
  console.log(`[Router Guard] Navigating: From ${from?.path || 'N/A'} To ${to.path}. Token Valid (loggedIn): ${loggedIn}`);
  const whiteList = ['/login', '/register']; // 白名单路由

  // 1. 如果要去的是白名单页面
  if (whiteList.includes(to.path)) {
    // 1.1 如果已登录，且要去登录页，重定向到首页
    if (loggedIn && to.path === '/login') {
      console.log('[Router Guard] Already logged in, accessing /login. Redirecting to /.');
      next({ path: '/', replace: true }); // 使用 return 避免后续代码执行 (虽然 next() 本身会中断)
    } else {
      // 1.2 如果未登录，或已登录但去的是注册页，直接放行
      console.log('[Router Guard] Accessing whitelist page or not logged in accessing /login/register. Allowing.');
      next();
    }
  }
  // 2. 如果要去的不是白名单页面 (即受保护页面)
  else {
    // 2.1 如果已登录，放行
    if (loggedIn) {
      console.log('[Router Guard] Logged in, accessing protected page. Allowing.');
      // --- 设置页面标题 (保持不变) ---
      let title = '体育管理系统';
      const microAppPrefixes = ['/posts', '/assistant', '/user', '/venue', '/equipment', '/events', '/finance', '/hr'];
      const isMicroAppRoute = microAppPrefixes.some(prefix =>
          to.path === prefix || to.path.startsWith(`${prefix}/`)
      );
      if (to.meta && to.meta.title) {
        title = `${to.meta.title} - ${title}`;
      } else if (isMicroAppRoute) {
        const appName = to.path.split('/')[1];
        switch(appName) {
          case 'posts': title = `体育论坛 - ${title}`; break;
          case 'assistant': title = `智能助理 - ${title}`; break;
          case 'user': title = `用户信息 - ${title}`; break;
          case 'venue': title = `体育场地 - ${title}`; break;
          case 'equipment': title = `体育器材 - ${title}`; break;
          case 'events': title = `体育赛事 - ${title}`; break;
          case 'finance': title = `体育开支 - ${title}`; break;
          case 'hr': title = `体育人事 - ${title}`; break;
        }
      }
      document.title = title;
      // --- 放行 ---
      next();
    }
    // 2.2 如果未登录，**先提示，再重定向**
    else {
      console.log('[Router Guard] Not logged in, accessing protected page. Showing message and redirecting to /login.');

      // --- !!! 在这里直接调用 Message.warning !!! ---
      // 这是显示“登录过期”提示的最佳位置，因为它发生在实际重定向前
      try {
        Message.warning({
          message: '登录状态已过期或无效，请重新登录',
          duration: 3000, // 消息显示 3 秒
          onClose: () => { console.log('[Router Guard] Expired/invalid token message closed.'); } // 可选调试
        });
        console.log('[Router Guard] Message.warning call potentially succeeded.');
      } catch (msgError) {
        console.error('[Router Guard] Error calling Message.warning:', msgError);
        // alert('登录状态已过期或无效，请重新登录 (Fallback Alert)'); // 后备方案
      }
      // --- END OF MESSAGE CALL ---

      // 可选：在这里清除无效 token (如果 isTokenValid 内部没做)
      // localStorage.removeItem('auth_token');

      // --- 然后执行重定向到登录页 ---
      next({
        path: '/login',
        replace: true, // 使用 replace 避免用户可以通过浏览器后退回到需要登录的页面
        query: { redirect: to.fullPath } // 保存用户原本想去的地址，登录后可以跳回
      });
    }
  }
});

// --- 全局导航错误处理 ---
// 主要用于捕获 NavigationDuplicated 和其他非预期路由错误
router.onError(error => {
  // --- 1. 添加顶层日志，确认处理器是否被触发 ---
  console.log('!!!!!! router.onError 处理器被触发了 !!!!!! Error Name:', error.name, 'Message:', error.message);
  // 打印原始错误对象，便于查看更多细节
  console.error('[Router Error Handler] Caught Raw Error:', error);

  // --- 2. 检查错误类型 ---
  const isRedirectError = error.message && error.message.includes('Redirected when going from');
  const isNavDuplicated = error.name === 'NavigationDuplicated';

  // --- 3. 处理 "Redirected" 错误 ---
  // 注意：我们不再在这里显示“登录过期”消息，因为它已在 beforeEach 中处理。
  // 但我们仍然可以记录这个错误，确认它是否被 onError 捕获。
  if (isRedirectError) {
    console.warn('[Router Error Handler] Caught Redirected error. User message was handled in beforeEach. Error:', error.message);
    // 不需要在这里做任何用户界面操作
  }
  // --- 4. 处理 "NavigationDuplicated" 错误 (重复导航到同一路由) ---
  else if (isNavDuplicated) {
    // 通常我们忽略这个错误，或者只在控制台给个警告
    console.warn('[Router Error Handler] Navigation duplicated. Ignoring.');
    // 如果需要，也可以给用户提示，但一般不建议打扰用户
    // Vue.nextTick(() => { Message.info('您已在当前页面'); });
  }
  // --- 5. 处理其他未预料到的路由错误 ---
  else {
    console.error('Unhandled Vue Router Error:', error);
    // --- 同样使用 nextTick 和 try...catch 保证健壮性 ---
    Vue.nextTick(() => { // 使用 nextTick 确保在 DOM 更新后显示消息
      try {
        Message.error({
          message: '页面跳转时发生未知错误，请稍后重试',
          duration: 3000
        });
      } catch (msgError) {
        console.error('[Router Error Handler] Error calling Message.error:', msgError);
        // alert('页面跳转时发生未知错误 (Fallback Alert)');
      }
    });
  }
});

// 导出 router 实例
export default router;
