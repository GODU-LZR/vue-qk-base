<template>
  <el-container class="app-container">
    <!-- 顶部搜索栏 -->
    <top-header v-if="isLoggedIn"></top-header>

    <el-container>
      <!-- 左侧导航 -->
      <side-bar v-if="isLoggedIn"></side-bar>

      <!-- 主要内容：挂载子应用 -->
      <el-main class="main-content">
        <!-- qiankun 子应用容器 -->
        <div id="micro-container" style="min-height: 600px; background: #fff; padding: 20px;" v-if="isLoggedIn">
          <router-view></router-view>
        </div>
        <!-- 显示登录页面 -->
        <login-page v-if="!isLoggedIn"></login-page>
      </el-main>
    </el-container>

    <el-footer class="footer-container">
      © 2025 体育管理系统
    </el-footer>
  </el-container>
</template>

<script>
import TopHeader from './components/TopHeader.vue';
import SideBar from './components/SideBar.vue';
import LoginPage from './components/LoginPage.vue';

export default {
  name: 'App',
  components: {
    TopHeader,
    SideBar,
    LoginPage,
  },
  data() {
    return {
      isLoggedIn: false,  // 初始化为未登录状态
    };
  },
  watch: {
    // 监听路由变化
    '$route': {
      immediate: true,
      handler(to) {
        this.checkLoginStatus();
      }
    }
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    }
  },
  mounted() {
    this.checkLoginStatus();
    // 监听登录状态变化
    window.addEventListener('storage', this.checkLoginStatus);
  },
  beforeDestroy() {
    // 清理事件监听
    window.removeEventListener('storage', this.checkLoginStatus);
  }
};
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}

.main-content {
  padding: 20px;
  background: #f0f2f5;
}

.footer-container {
  text-align: center;
  padding: 20px;
  background: #fff;
  border-top: 1px solid #e8e8e8;
}
</style>
