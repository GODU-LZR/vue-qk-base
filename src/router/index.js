import Vue from 'vue';
import Router from 'vue-router';
import { Message } from 'element-ui';
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

// 路由定义 (保持不变)
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
  // --- 其他子应用路由占位符 ---
  // 实际组件由 Qiankun 加载，这里仅用于路由定义
  { path: '/posts', name: 'Posts', component: { template: '<div></div>' }, meta: { title: '体育论坛', requiresAuth: true } },
  { path: '/assistant', name: 'Assistant', component: { template: '<div></div>' }, meta: { title: '智能助理', requiresAuth: true } },
  { path: '/user', name: 'User', component: { template: '<div></div>' }, meta: { title: '用户信息', requiresAuth: true } },
  { path: '/venue', name: 'Venue', component: { template: '<div></div>' }, meta: { title: '体育场地', requiresAuth: true } },
  { path: '/equipment', name: 'Equipment', component: { template: '<div></div>' }, meta: { title: '体育器材', requiresAuth: true } },
  { path: '/events', name: 'Events', component: { template: '<div></div>' }, meta: { title: '体育赛事', requiresAuth: true } },
  { path: '/finance', name: 'Finance', component: { template: '<div></div>' }, meta: { title: '体育开支', requiresAuth: true } },
  { path: '/hr', name: 'HR', component: { template: '<div></div>' }, meta: { title: '体育人事', requiresAuth: true } },
  // --- 通配符路由 ---
  // 注意: 考虑是否与 Qiankun 的 activeRule 冲突
  { path: '*', component: { template: '<div id="subapp-catchall">页面未找到</div>' } }
];

// 处理 NavigationDuplicated 错误 (保持不变)
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated' && !err.message.includes('Redirected when going from')) {
      console.error('Router push error:', err); // 添加日志方便调试
      throw err;
    }
    // console.warn('Navigation prevented in push:', err.message);
  });
};
const originalReplace = Router.prototype.replace;
Router.prototype.replace = function replace(location, onResolve, onReject) {
  if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject);
  return originalReplace.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated' && !err.message.includes('Redirected when going from')) {
      console.error('Router replace error:', err); // 添加日志方便调试
      throw err;
    }
    // console.warn('Navigation prevented in replace:', err.message);
  });
};


// 创建 Router 实例
const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL || '/', // 使用环境变量或默认为 '/'
  routes,
});

// --- 全局前置守卫 (核心修改：增加循环中断逻辑) ---

// 添加一个标志来检测是否正在由守卫主动重定向到登录页
let isRedirectingToLogin = false;

router.beforeEach((to, from, next) => {
  // 检查当前 Token 是否有效 (确保 isTokenValid 是同步且可靠的)
  const loggedIn = isTokenValid();
  console.log(`[Router Guard] Navigating: From ${from?.path || 'N/A'} To ${to.path}. Token Valid: ${loggedIn}`);
  const whiteList = ['/login', '/register']; // 公开访问路由列表

  // --- 1. 处理目标是登录页的情况 ---
  if (to.path === '/login') {
    // 1.1 如果标志为 true，说明是上一次守卫触发的重定向，直接放行以完成跳转
    if (isRedirectingToLogin) {
      console.log('[Router Guard] 检测到重入 /login (由守卫重定向引起)，放行本次 next() 调用');
      isRedirectingToLogin = false; // 重置标志，表示重定向过程完成
      next(); // 放行
      return; // 结束守卫
    }
    // 1.2 如果用户已登录，却要访问登录页，重定向到首页
    if (loggedIn) {
      console.log('[Router Guard] 用户已登录，但尝试访问 /login，重定向到 /');
      next({ path: '/', replace: true }); // 使用 replace 避免历史记录问题
      return; // 结束守卫
    } else {
      // 1.3 如果用户未登录，且不是守卫重定向过来的 (例如直接访问或点击链接)，允许访问登录页
      console.log('[Router Guard] 用户未登录，访问 /login，允许');
      next(); // 放行
      return; // 结束守卫
    }
  }

  // --- 2. 处理目标是注册页的情况 ---
  if (to.path === '/register') {
    // 通常允许直接访问注册页，无论登录状态如何
    console.log('[Router Guard] 访问 /register，允许');
    next(); // 放行
    return; // 结束守卫
  }

  // --- 3. 处理目标是需要认证的页面 ---
  // 使用 to.matched 检查路由记录链中是否有 meta.requiresAuth
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (loggedIn) {
      // 3.1 用户已登录，允许访问
      console.log(`[Router Guard] 用户已登录，允许访问受保护页面 ${to.path}`);
      // 设置页面标题
      document.title = to.meta?.title ? `${to.meta.title} - 体育管理系统` : '体育管理系统';
      next(); // 放行
      return; // 结束守卫
    } else {
      // 3.2 用户未登录，需要重定向到登录页
      console.log(`[Router Guard] 用户未登录，尝试访问受保护页面 ${to.path}，重定向到 /login`);

      // 显示提示信息 (如果需要且没有重复显示)
      if (!document.querySelector('.el-message.el-message--warning')) { // 更精确地检查特定类型的消息
        try {
          Message.warning({ message: '登录状态已过期或无效，请重新登录', duration: 3000 });
          console.log('[Router Guard] 显示了 Token 无效提示');
        } catch (msgError) { console.error('[Router Guard] 调用 Message.warning 时出错:', msgError); }
      } else { console.log('[Router Guard] Token 无效提示已显示，跳过'); }

      // --- 关键步骤：准备重定向 ---
      console.log('[Router Guard] 设置 isRedirectingToLogin = true');
      isRedirectingToLogin = true; // 设置标志，表明是守卫发起的重定向

      console.log('[Router Guard] 执行 next({ path: \'/login\', replace: true })');
      next({
        path: '/login',
        replace: true // 使用 replace 模式
      });

      // --- 关键步骤：立即返回 ---
      console.log('[Router Guard] 重定向已发起，立即返回');
      return; // 确保 next() 调用后守卫逻辑终止，防止意外执行后续代码或被其他逻辑干扰
    }
  }

  // --- 4. 其他情况 (访问不需要认证的非白名单页面，例如通配符路由) ---
  console.log(`[Router Guard] 访问无需认证页面 ${to.path}，允许`);
  next(); // 默认放行
});

// --- 全局导航错误处理 (保持不变) ---
router.onError(error => {
  console.log('!!!!!! router.onError 处理器被触发了 !!!!!!');
  console.error('[Router Error Handler] 捕获到原始错误:', error);
  console.error(`[Router Error Handler] 错误名称: ${error.name}, 错误消息: ${error.message}`);
  if (error.stack) {
    console.error('[Router Error Handler] 错误堆栈:', error.stack);
  }

  const isRedirectError = error.message && error.message.includes('Redirected when going from');
  const isNavDuplicated = error.name === 'NavigationDuplicated';
  const isDOMSecurityError = error.name === 'DOMException' && error.message.includes('The operation is insecure');

  if (isRedirectError) {
    console.warn('[Router Error Handler] 捕获到重定向错误 (通常预期内，由 beforeEach 处理):', error.message);
  }
  else if (isNavDuplicated) {
    console.warn('[Router Error Handler] 导航重复，忽略');
  }
  else if (isDOMSecurityError) {
    console.error('[Router Error Handler] 捕获到 DOM 安全异常，可能与微前端或浏览器状态有关');
    Vue.nextTick(() => {
      try {
        Message.error({ message: '页面状态异常，请尝试刷新页面', duration: 5000 });
      } catch (msgError) { console.error('[Router Error Handler] 调用 Message.error 时出错 (DOM 安全异常):', msgError); }
    });
  }
  else {
    console.error('未处理的 Vue Router 错误:', error);
    Vue.nextTick(() => {
      try {
        Message.error({ message: '页面跳转时发生未知错误，请稍后重试', duration: 5000 });
      } catch (msgError) { console.error('[Router Error Handler] 调用 Message.error 时出错 (未知错误):', msgError); }
    });
  }
});

// 导出 router 实例
export default router;
