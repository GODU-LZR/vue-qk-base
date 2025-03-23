// src/router/index.js
import Vue from 'vue';
import Router from 'vue-router';
import LoginPage from '../components/LoginPage.vue';

Vue.use(Router);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: {
      template: '<div>主应用首页</div>',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/posts',
    name: 'Posts',
    component: {
      template: '<div>帖子子应用路由激活时加载</div>',
    },
  },
  // 其他子应用路由...
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
  mode: 'hash', // 使用hash模式，确保url不会与基座的路由冲突
  base: '/',
  routes,
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (to.name === 'Login') {
    // 如果要去登录页
    if (isLoggedIn) {
      // 已登录则重定向到首页，使用 replace
      next({ path: '/', replace: true });
    } else {
      next();
    }
  } else {
    // 如果要去其他页面
    if (!isLoggedIn) {
      // 未登录则重定向到登录页，使用 replace
      next({ path: '/login', replace: true });
    } else {
      next();
    }
  }
});

export default router;
