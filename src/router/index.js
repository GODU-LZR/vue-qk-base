// src/router.js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: {
      template: '<div>主应用首页</div>'
    }
  },
  // 当 URL 匹配 /posts 时，会激活子应用
  {
    path: '/posts',
    name: 'Posts',
    component: {
      template: '<div>帖子子应用路由激活时加载</div>'
    }
  },
  // 当 URL 匹配 /posts 时，会激活子应用
  {
    path: '/assistant',
    name: 'Assistant',
    component: {
      template: '<div>智能助理子应用路由激活时加载</div>'
    }
  },

]

export default new Router({
  mode: 'history',
  base: '/',
  routes
})
