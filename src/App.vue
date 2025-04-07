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
      智能城市体育云平台 V1.0 © 昆明茑能科技有限公司 2025
    </el-footer>
  </el-container>
</template>


<script>
import TopHeader from './components/TopHeader.vue';
import SideBar from './components/SideBar.vue';
import LoginView from './views/auth/LoginView.vue';
import { isTokenValid } from '@/api/modules/auth';
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
      microAppPrefixes: [],
      needsRefresh: false, // 用于标记是否需要刷新
      isFirstMount: true,  // 用于检测应用首次挂载
      isJustLoggedIn: false, // 用于检测刚刚登录
      storageListener: null//用于存储 storage 监听器引用，以便正确移除
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
      handler(to, from) {
        const wasLoggedIn = this.isLoggedIn;
        this.checkLoginStatus();
        console.log(`[App.vue Watch $route] 路由变化: ${from?.path || '首次加载'} -> ${to.path}, 检查后登录状态: ${this.isLoggedIn}`);

        // 检测来自登录页面的跳转
        if (from && from.name === 'Login' && this.isLoggedIn && !wasLoggedIn) {
          console.log('检测到登录完成，标记需要刷新');
          this.isJustLoggedIn = true;
          // 添加到浏览器历史状态，用于检测是否是刷新后的状态
          history.replaceState({ justLoggedIn: true }, document.title);

          // 延迟50ms刷新页面，确保状态已保存
          setTimeout(() => this.refreshBrowser(), 50);
        }

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
    },

    // 监听登录状态变化
    isLoggedIn(newVal, oldVal) {
      if (newVal && !oldVal) {
        // 刚刚登录，设置需要刷新
        this.needsRefresh = true;
        console.log('登录状态已变更，标记需要刷新');
      }
    }
  },
  methods: {
    checkLoginStatus() {
      const wasLoggedIn = this.isLoggedIn;
      // *** 修改点：使用 isTokenValid() 替代 localStorage.getItem('isLoggedIn') ***
      this.isLoggedIn = isTokenValid(); // 调用导入的函数检查 token

      if (this.isLoggedIn !== wasLoggedIn) {
        console.log(`[App.vue checkLoginStatus] 登录状态更新: ${wasLoggedIn} -> ${this.isLoggedIn} (基于 isTokenValid)`);
      }

      if (this.isLoggedIn && !wasLoggedIn && !this.isFirstMount) {
        this.needsRefresh = true;
        console.log('[App.vue checkLoginStatus] 检测到登录状态改变，标记需要刷新 (用户原有逻辑)');
      }
    },

    refreshBrowser() {
      // 检查是否是刚登录后刷新的状态
      if (history.state && history.state.justLoggedIn) {
        console.log('[App.vue refreshBrowser] 刷新后的状态，清除标记，不再重复刷新');
        // 清理标记，防止下次普通刷新时误判
        const currentState = { ...history.state };
        delete currentState.justLoggedIn;
        history.replaceState(currentState, document.title);
        return; // 退出，防止循环刷新
      }

      console.log('[App.vue refreshBrowser] 执行页面刷新以应用状态...');
      // *** 简化：直接刷新 ***
      window.location.reload();
      // --- 移除之前的导航逻辑 ---
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
    },

    ensureLayoutStability() {
      // 手动强制重新计算布局
      setTimeout(() => {
        // 触发窗口resize事件，促使组件重新计算尺寸
        window.dispatchEvent(new Event('resize'));

        const microContainer = document.getElementById('micro-container');
        if (microContainer) {
          // 确保容器有正确的尺寸
          microContainer.style.height = 'calc(100vh - 100px)';
          microContainer.style.width = '100%';
        }
      }, 100);
    },

    // 监听登录完成的事件
    onLoginCompleted() {
      // 设置需要刷新的标志
      this.needsRefresh = true;
      console.log('登录完成事件触发，准备刷新页面');

      // 延迟执行刷新，确保状态已保存
      setTimeout(() => this.refreshBrowser(), 100);
    },

    setupGlobalEventListeners() {
      window.addEventListener('login-completed', this.onLoginCompleted);

      // 定义监听函数并存储引用
      this.storageListener = (event) => {
        // *** 修改点：监听 auth_token 的变化，而不是 isLoggedIn ***
        if (event.key === 'auth_token') {
          console.log('[App.vue storage Listener] 检测到 localStorage 中的 auth_token 变化, 重新检查登录状态');
          // Token 变化时（其他标签页登录/登出），重新检查并更新状态
          this.checkLoginStatus();


          // 原逻辑是基于 isLoggedIn === 'true' 触发刷新
          // 现在改为：如果 auth_token 变为存在 (newValue 不为 null) 且之前不存在 (oldValue 为 null)
          // 这表示在其他标签页登录了，可以考虑刷新当前页以同步UI
          if (event.newValue !== null && event.oldValue === null) {
            console.log('[App.vue storage Listener] 检测到其他标签页登录，准备刷新 (基于 auth_token 变化)');
            // 注意：自动刷新可能打断用户操作，需谨慎使用
            // this.refreshBrowser(); // 如果需要，取消注释此行
          }
          // 如果 auth_token 从存在变为不存在 (登出)，checkLoginStatus 会更新 isLoggedIn 为 false，
          // UI 会自动响应（隐藏导航等），通常不需要强制刷新。

        }
      };
      // 添加监听器
      window.addEventListener('storage', this.storageListener);
      console.log('[App.vue setupGlobalEventListeners] 全局事件监听器已设置 (storage 监听 auth_token)');
    }
  },
  created() {
    this.initMicroAppPrefixes();
    this.checkLoginStatus();
    console.log(`[App.vue created] 初始登录状态检查完成: isLoggedIn = ${this.isLoggedIn}`);
    // 检查是否是从登录页刷新后的状态
    if (history.state && history.state.justLoggedIn) {
      console.log('检测到是刷新后的状态，标记已完成刷新');
      this.isJustLoggedIn = false;
    }
  },
  mounted() {
    this.checkLoginStatus();
    this.addGlobalStyles();
    this.ensureLayoutStability();
    this.setupGlobalEventListeners();

    // 标记第一次挂载已完成
    this.isFirstMount = false;

    // 检查URL参数是否含有需要刷新的标记(例如: ?refresh=true)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh') === 'true') {
      console.log('检测到URL参数请求刷新');
      // 清除URL参数
      const newUrl = window.location.pathname + window.location.hash;
      history.replaceState(null, '', newUrl);
    }
    // 检查是否需要显示加载遮罩
    if (localStorage.getItem('showLoadingMask') === 'true') {
      // 清除标记
      localStorage.removeItem('showLoadingMask');

      // 检查是否已存在遮罩
      let mask = document.getElementById('global-loading-mask');

      // 如果没有遮罩但需要显示，创建一个
      if (!mask) {
        mask = document.createElement('div');
        mask.id = 'global-loading-mask';
        mask.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #4285f4; /* 蓝色背景 */
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      flex-direction: column;
      transition: opacity 0.5s;
    `;

        mask.innerHTML = `
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .global-loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-top: 5px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-top: 30px;
        }
        .global-system-title {
          font-size: 24px;
          color: #ffffff;
          font-family: Arial, sans-serif;
          font-weight: bold;
          margin-top: 15px;
        }
        .global-loading-text {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.8);
          font-family: Arial, sans-serif;
          margin-top: 5px;
        }
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .global-icon {
          font-size: 40px;
          color: #ffffff;
        }
      </style>
      <div class="logo-container">
        <i class="el-icon-basketball global-icon"></i>
      </div>
      <div class="global-system-title">体育管理系统</div>
      <div class="global-loading-text">加载中，请稍候...</div>
      <div class="global-loading-spinner"></div>
    `;

        document.body.appendChild(mask);
      }

      // 页面加载完成后延迟移除遮罩
      window.addEventListener('load', () => {
        setTimeout(() => {
          if (mask) {
            // 淡出效果
            mask.style.opacity = '0';
            setTimeout(() => {
              if (mask && mask.parentNode) {
                mask.parentNode.removeChild(mask);
              }
            }, 500); // 等待淡出动画完成
          }
        }, 3000); // 等待内容渲染完成
      });
    }
  },
  beforeDestroy() {
    // 清理事件监听
    window.removeEventListener('login-completed', this.onLoginCompleted);
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      console.log('[App.vue beforeDestroy] storage 事件监听器已移除');
    }
    // 移除全局样式
    const style = document.getElementById('hide-scrollbar-style');
    if (style) {
      document.head.removeChild(style);
    }
  },
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
