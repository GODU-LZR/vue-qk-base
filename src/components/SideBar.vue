<template>
  <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar-menu">
    <div class="toggle-button" @click="toggleCollapse">
      <i :class="isCollapse ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'"></i>
    </div>

    <el-menu
        :default-active="activeIndex"
        :collapse="isCollapse"
        router
        class="sidebar-el-menu"
        background-color="#fff"
        text-color="#606266"
        active-text-color="#409EFF"
    >
      <el-menu-item index="/posts" class="menu-item">
        <i class="el-icon-chat-dot-square"></i>
        <span slot="title">体育论坛</span>
      </el-menu-item>

      <el-menu-item index="/assistant" class="menu-item">
        <i class="el-icon-s-help"></i>
        <span slot="title">智能助理</span>
      </el-menu-item>

      <el-menu-item index="/user" class="menu-item">
        <i class="el-icon-user"></i>
        <span slot="title">用户信息</span>
      </el-menu-item>

      <el-menu-item index="/venue" class="menu-item">
        <i class="el-icon-office-building"></i>
        <span slot="title">体育场地</span>
      </el-menu-item>

      <el-menu-item index="/equipment" class="menu-item">
        <i class="el-icon-basketball"></i>
        <span slot="title">体育器材</span>
      </el-menu-item>

      <el-menu-item index="/events" class="menu-item">
        <i class="el-icon-trophy"></i>
        <span slot="title">体育赛事</span>
      </el-menu-item>

      <el-menu-item index="/finance" class="menu-item">
        <i class="el-icon-money"></i>
        <span slot="title">体育开支</span>
      </el-menu-item>

      <el-menu-item index="/hr" class="menu-item">
        <i class="el-icon-user-solid"></i>
        <span slot="title">体育人事</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  name: 'SideBar',
  data() {
    return {
      activeIndex: '',
      isCollapse: false
    };
  },
  methods: {
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
      this.$emit('collapse-change', this.isCollapse);
    },
    handleSelect(key) {
      this.activeIndex = key;
    },
    resetMenuHighlight() {
      this.activeIndex = this.$route.path;
    }
  },
  watch: {
    '$route': {
      handler: function(val) {
        this.activeIndex = val.path;
      },
      immediate: true
    }
  },
  mounted() {
    // 设置初始选中菜单
    this.activeIndex = this.$route.path;
  }
};
</script>

<style scoped>
.sidebar-menu {
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100vh;
  position: relative;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-el-menu {
  border: none;
  height: calc(100% - 50px);
  transition: width 0.3s ease !important;
}

.sidebar-el-menu:not(.el-menu--collapse) {
  width: 200px;
}

.toggle-button {
  height: 40px;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  border-bottom: 1px solid #e6e6e6;
  transition: all 0.3s ease;
}

.toggle-button:hover {
  background-color: #ecf5ff;
  color: #409EFF;
}

/* 优化菜单项样式 */
.menu-item {
  position: relative;
  transition: all 0.3s ease;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: #409EFF;
  transform: scaleY(0);
  transition: transform 0.2s, opacity 0.2s;
  opacity: 0;
}

.menu-item:hover::before {
  transform: scaleY(1);
  opacity: 1;
}

/* 动画效果 */
.el-menu-item {
  transition: all 0.3s cubic-bezier(.25,.8,.25,1) !important;
  padding: 0 15px !important;
}

.el-menu-item i {
  margin-right: 10px;
  font-size: 18px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.menu-item {
  animation: fadeIn 0.5s ease forwards;
  animation-delay: calc(var(--index) * 0.1s);
  opacity: 0;
}

.menu-item:nth-child(1) { --index: 1; }
.menu-item:nth-child(2) { --index: 2; }
.menu-item:nth-child(3) { --index: 3; }
.menu-item:nth-child(4) { --index: 4; }
.menu-item:nth-child(5) { --index: 5; }
.menu-item:nth-child(6) { --index: 6; }
.menu-item:nth-child(7) { --index: 7; }
.menu-item:nth-child(8) { --index: 8; }
</style>
