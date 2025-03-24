import Vue from 'vue';
import Router from 'vue-router';
import LoginView from '../views/auth/LoginView.vue';
import RegisterView from '../views/auth/RegisterView.vue';

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
    meta: { title: '首页' }
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
  {
    path: '/posts',
    name: 'Posts',
    component: {
      template: '<div>帖子子应用路由激活时加载</div>',
    },
    meta: { title: '体育论坛' }
  },
  {
    path: '/assistant',
    name: 'Assistant',
    component: {
      template: '<div>智能助理子应用路由激活时加载</div>',
    },
    meta: { title: '智能助理' }
  },
  {
    path: '/user',
    name: 'User',
    component: {
      template: '<div>用户信息子应用路由激活时加载</div>',
    },
    meta: { title: '用户信息' }
  },
  {
    path: '/venue',
    name: 'Venue',
    component: {
      template: '<div>体育场地子应用路由激活时加载</div>',
    },
    meta: { title: '体育场地' }
  },
  {
    path: '/equipment',
    name: 'Equipment',
    component: {
      template: '<div>体育器材子应用路由激活时加载</div>',
    },
    meta: { title: '体育器材' }
  },
  {
    path: '/events',
    name: 'Events',
    component: {
      template: '<div>体育赛事子应用路由激活时加载</div>',
    },
    meta: { title: '体育赛事' }
  },
  {
    path: '/finance',
    name: 'Finance',
    component: {
      template: '<div>体育开支子应用路由激活时加载</div>',
    },
    meta: { title: '体育开支' }
  },
  {
    path: '/hr',
    name: 'HR',
    component: {
      template: '<div>体育人事子应用路由激活时加载</div>',
    },
    meta: { title: '体育人事' }
  },
  // 重要：添加通配符路由，捕获所有未匹配的路由
  // 这对于子应用中的嵌套路由非常重要
  {
    path: '*',
    component: {
      template: '<div id="subapp-catchall"></div>'
    }
  }
];

// 在创建路由实例之前
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      throw err;
    }
  });
};

const router = new Router({
  mode: 'history', // 修改为 history 模式以匹配子应用
  base: '/',
  routes,
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // 免登录白名单，登录页和注册页不需要登录即可访问
  const whiteList = ['Login', 'Register'];

  // 子应用路由前缀，这些路由应该被直接放行给子应用处理
  const microAppPrefixes = ['/posts', '/assistant', '/user', '/venue', '/equipment', '/events', '/finance', '/hr'];

  // 检查当前路由是否是子应用路由
  const isMicroAppRoute = microAppPrefixes.some(prefix =>
      to.path === prefix || to.path.startsWith(`${prefix}/`)
  );

  if (whiteList.includes(to.name)) {
    // 如果目标路由在白名单中
    if (isLoggedIn && to.name === 'Login') {
      // 已登录用户访问登录页，重定向到首页
      next({ path: '/', replace: true });
    } else {
      // 其他情况直接放行
      next();
    }
  } else if (isMicroAppRoute) {
    // 子应用路由，检查登录状态后直接放行
    if (!isLoggedIn) {
      next({ path: '/login', replace: true });
    } else {
      // 子应用路由且已登录，直接放行
      next();

      // 为子应用路由设置页面标题
      const appName = to.path.split('/')[1];
      let title = '体育管理系统';

      switch(appName) {
        case 'posts': title = '体育论坛'; break;
        case 'assistant': title = '智能助理'; break;
        case 'user': title = '用户信息'; break;
        case 'venue': title = '体育场地'; break;
        case 'equipment': title = '体育器材'; break;
        case 'events': title = '体育赛事'; break;
        case 'finance': title = '体育开支'; break;
        case 'hr': title = '体育人事'; break;
      }

      document.title = `${title} - 体育管理系统`;
    }
  } else {
    // 其他路由，检查登录状态
    if (!isLoggedIn) {
      // 未登录用户访问非白名单页面，重定向到登录页
      next({ path: '/login', replace: true });
    } else {
      // 已登录用户访问非白名单页面，直接放行
      next();

      // 设置页面标题
      if (to.meta && to.meta.title) {
        document.title = `${to.meta.title} - 体育管理系统`;
      }
    }
  }
});

export default router;
