<template>
  <el-container class="app-container">
    <!-- 顶部搜索栏 -->
    <top-header v-if="isLoggedIn"></top-header>

    <el-container class="body-container">
      <!-- 左侧导航 -->
      <side-bar v-if="isLoggedIn" @collapse-change="handleSidebarCollapse"></side-bar>

      <!-- 主要内容区域 -->
      <el-main class="main-content no-padding" :class="{'main-content-expanded': isCollapsed}">
        <!-- 微应用容器 - 不要使用v-if，改用v-show或总是渲染 -->
        <div id="micro-container" class="micro-container full-size"></div>

        <!-- 根据路由显示内容 - 使用v-show控制显示/隐藏 -->
        <router-view v-show="($route.name === 'Login' || $route.name === 'Register' || isLoggedIn) && !isMicroAppRoute"></router-view>

        <!-- 未登录且不在登录/注册页，显示登录页面 -->
        <login-view v-show="!isLoggedIn && $route.name !== 'Login' && $route.name !== 'Register'"></login-view>
      </el-main>
    </el-container>

    <el-footer class="footer-container" v-if="isLoggedIn">
      © 2025 体育管理系统
    </el-footer>
  </el-container>
</template>


<script>
import TopHeader from './components/TopHeader.vue';
import SideBar from './components/SideBar.vue';
import LoginView from './views/auth/LoginView.vue';
// 导入微应用配置
import microApps from './micro/apps';

export default {
  name: 'App',
  components: {
    TopHeader,
    SideBar,
    LoginView,
  },
  data() {
    return {
      isLoggedIn: false,  // 初始化为未登录状态
      isCollapsed: false,  // 侧边栏是否折叠
      microAppPrefixes: ['/venue', '/posts', '/assistant', '/user', '/equipment', '/events', '/finance', '/hr']
    };
  },
  computed: {
    isMicroAppRoute() {
      // 判断当前路由是否为微应用路由
      const currentPath = this.$route.path;
      return this.microAppPrefixes.some(prefix =>
          currentPath === prefix || currentPath.startsWith(`${prefix}/`)
      );
    }
  },
  watch: {
    // 监听路由变化
    '$route': {
      immediate: true,
      handler(to) {
        this.checkLoginStatus();

        // 更新页面标题
        if (to.meta && to.meta.title) {
          document.title = `${to.meta.title} - 体育管理系统`;
        } else {
          document.title = '体育管理系统';
        }

        // 微应用路由调试
        if (this.isMicroAppRoute) {
          console.log('当前路由是微应用路由:', to.path);

          // 当路由变化到微应用路由时，设置微应用容器样式
          this.$nextTick(() => {
            const container = document.getElementById('micro-container');
            if (container) {
              // 确保微应用容器样式正确
              container.style.height = 'calc(100vh - 100px)'; // 减少顶部和底部的空间
              container.style.overflow = 'auto';
            }
          });
        }
      }
    }
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    },
    handleSidebarCollapse(collapsed) {
      this.isCollapsed = collapsed;
    },
    initMicroAppPrefixes() {
      // 从微应用配置中提取路由前缀
      if (microApps && microApps.length) {
        this.microAppPrefixes = microApps.map(app => app.activeRule);
      }
    },
    addGlobalStyles() {
      // 在head中添加全局样式，隐藏基座滚动条
      if (!document.getElementById('hide-scrollbar-style')) {
        const style = document.createElement('style');
        style.id = 'hide-scrollbar-style';
        style.innerHTML = `
          /* 隐藏基座页面的滚动条 - 兼容各浏览器 */
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden !important;
          }

          /* Chrome, Safari, Edge, Opera */
          body::-webkit-scrollbar,
          .app-container::-webkit-scrollbar,
          .body-container::-webkit-scrollbar,
          .main-content::-webkit-scrollbar,
          .el-main::-webkit-scrollbar {
            width: 0 !important;
            display: none !important;
          }

          /* Firefox */
          body, .app-container, .body-container, .main-content, .el-main {
            scrollbar-width: none !important;
          }

          /* IE */
          body, .app-container, .body-container, .main-content, .el-main {
            -ms-overflow-style: none !important;
          }

          /* 确保微应用容器可以滚动 */
          #micro-container::-webkit-scrollbar {
            width: 6px !important;
            display: block !important;
          }

          #micro-container {
            scrollbar-width: thin !important;
            -ms-overflow-style: auto !important;
          }

          #micro-container::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
          }

          #micro-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
          }

          /* 移除 Element UI 默认内边距 */
          .el-container {
            padding: 0 !important;
            margin: 0 !important;
          }

          .el-main {
            padding: 0 !important;
          }

          .el-footer {
            padding: 10px 0 !important;
            height: auto !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  },
  created() {
    this.initMicroAppPrefixes();
  },
  mounted() {
    this.checkLoginStatus();
    this.addGlobalStyles();

    // 监听登录状态变化
    window.addEventListener('storage', this.checkLoginStatus);
  },
  beforeDestroy() {
    // 清理事件监听
    window.removeEventListener('storage', this.checkLoginStatus);

    // 移除全局样式
    const style = document.getElementById('hide-scrollbar-style');
    if (style) {
      document.head.removeChild(style);
    }
  }
};
</script>

<style>
/* 全局样式，不使用scoped */
.app-container {
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.body-container {
  flex: 1;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* 移除内边距 */
.no-padding {
  padding: 0 !important;
}

.main-content {
  background: #f0f2f5;
  transition: margin-left 0.3s;
  overflow: hidden;
  height: calc(100vh - 100px); /* 减少顶部和底部的空间 */
  margin: 0;
  padding: 0 !important;
}

/* 让微应用容器充满整个空间 */
.micro-container.full-size {
  background: #fff;
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  overflow: auto;
  border-radius: 0;
  box-shadow: none;
}

.main-content-expanded {
  margin-left: -180px;
}

.footer-container {
  text-align: center;
  padding: 10px 0;
  background: #1d4ed8;
  border-top: 1px solid #e8e8e8;
  font-size: 12px;
  color: #fff;
  height: auto !important;
  line-height: 20px;
}

/* Element UI 的组件样式覆盖 */
.el-main {
  padding: 0 !important;
  margin: 0 !important;
}

.el-footer {
  padding: 10px 0 !important;
  height: auto !important;
}

/* 定制微应用容器滚动条样式 */
.micro-container::-webkit-scrollbar {
  width: 6px;
}

.micro-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.micro-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

</style>
