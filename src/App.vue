<!-- vue-qk-base/src/App.vue -->
<template>
  <el-container class="app-container">
    <!-- 顶部搜索栏 -->
    <top-header></top-header>

    <el-container>
      <!-- 左侧导航 -->
      <side-bar></side-bar>

      <!-- 主要内容：挂载子应用 -->
      <el-main class="main-content">
        <!-- qiankun 子应用容器 -->
        <div id="micro-container" style="min-height: 600px; background: #fff; padding: 20px;">
          <!-- 子应用会被动态插入到这里 -->
        </div>
      </el-main>
    </el-container>

    <el-footer class="footer-container">
      ? 2025 体育管理系统
    </el-footer>
  </el-container>
</template>

<script>
import TopHeader from './components/TopHeader.vue';
import SideBar from './components/SideBar.vue';

export default {
  name: 'App',
  components: {
    TopHeader,
    SideBar
  }
};
</script>

<style>
.app-container {
  min-height: 100vh;
}

.main-content {
  background-color: #f5f5f5;
  padding: 0;
}

.footer-container {
  text-align: center;
  background-color: #2f54eb;
  color: #fff;
}
</style>