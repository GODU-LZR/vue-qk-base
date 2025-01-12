<!-- vue-qk-base/src/components/SideBar.vue -->
<template>
  <el-aside width="250px" class="sidebar-menu">
    <el-menu
        :default-active="activeIndex"
        router
        class="sidebar-el-menu"
    >
      <el-menu-item index="/posts">体育论坛</el-menu-item>
      <el-menu-item index="/assistant">智能助理</el-menu-item>
      <el-menu-item index="/user">用户信息</el-menu-item>
      <el-menu-item index="/venue">体育场地</el-menu-item>
      <el-menu-item index="/equipment">体育器材</el-menu-item>
      <el-menu-item index="/events">体育赛事</el-menu-item>
      <el-menu-item index="/finance">体育开支</el-menu-item>
      <el-menu-item index="/hr">体育人事</el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  name: 'SideBar',
  data() {
    return {
      activeIndex: '' // 可根据路由自动高亮
    };
  },
  mounted() {
    // 如果有路由，可在此根据 currentRoute 设置 activeIndex
  }
};
</script>

<style scoped>
.sidebar-menu {
  background-color: #fff;
  border-right: 1px solid #ccc;
  min-height: calc(100vh - 60px); /* 顶部 header 占 60px */
}
.sidebar-el-menu {
  border: none;
}
</style>