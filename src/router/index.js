import Vue from 'vue';
import Router from 'vue-router';
import LoginView from '../views/auth/LoginView.vue';
import RegisterView from '../views/auth/RegisterView.vue';
// --- 1. 引入可靠的登录检查函数 ---
// 请确保这个路径是正确的，指向你定义 isTokenValid 的文件
import { isTokenValid } from '@/api/modules/auth';

Vue.use(Router);

// 创建默认首页组件
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
  { path: '*', component: { template: '<div id="subapp-catchall"></div>' } }
];

// 在创建路由实例之前 (处理 NavigationDuplicated 错误)
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      throw err;
    }
  });
};
const originalReplace = Router.prototype.replace;
Router.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      throw err;
    }
  });
};


const router = new Router({
  mode: 'history',
  base: '/',
  routes,
});

// --- 全局前置守卫 ---
router.beforeEach((to, from, next) => {
  // --- 2. 使用 isTokenValid() 进行登录检查 ---
  const loggedIn = isTokenValid();
  console.log(`[Router Guard] Navigating: From ${from?.path || 'N/A'} To ${to.path}. Token Valid (loggedIn): ${loggedIn}`);

  const whiteList = ['/login', '/register']; // 免登录白名单

  // --- 3. 修正守卫逻辑 ---
  if (whiteList.includes(to.path)) {
    // 访问白名单页面 (登录页/注册页)
    if (loggedIn && to.path === '/login') {
      // 如果已登录，访问登录页 -> 重定向到首页
      console.log('[Router Guard] Already logged in, accessing /login. Redirecting to /.');
      return next({ path: '/', replace: true }); // 使用 return 确保只调用一次 next
    } else {
      // 访问注册页，或未登录访问登录页 -> 直接放行
      console.log('[Router Guard] Accessing whitelist page or not logged in accessing /login. Allowing.');
      return next(); // 使用 return
    }
  } else {
    // 访问需要认证的页面 (非白名单)
    if (loggedIn) {
      // 已登录 -> 放行
      console.log('[Router Guard] Logged in, accessing protected page. Allowing.');

      // --- 4. 在放行前设置标题 ---
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

      return next(); // 使用 return
    } else {
      // 未登录 -> 重定向到登录页
      console.log('[Router Guard] Not logged in, accessing protected page. Redirecting to /login.');
      return next({
        path: '/login',
        replace: true,
        query: { redirect: to.fullPath } // 保留重定向地址，登录后可以跳回
      }); // 使用 return
    }
  }

});


export default router;
