<template>
  <el-dropdown trigger="click" @command="$emit('command', $event)" class="avatar-dropdown">
    <div class="avatar-container">
      <el-avatar :size="36" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
      <span class="username">管理员</span>
      <i class="el-icon-arrow-down el-icon--right"></i>
    </div>
    <el-dropdown-menu slot="dropdown" class="user-dropdown-menu">
      <el-dropdown-item command="profile">
        <i class="el-icon-user"></i> 个人中心
      </el-dropdown-item>
      <el-dropdown-item command="settings">
        <i class="el-icon-setting"></i> 系统设置
      </el-dropdown-item>
      <el-dropdown-item divided command="logout">
        <i class="el-icon-switch-button"></i> 退出登录
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'UserMenu'
}
</script>

<style scoped>
.avatar-dropdown {
  margin-left: 15px;
  cursor: pointer;
  height: 60px;
  display: flex;
  align-items: center;
}

.avatar-container {
  display: flex;
  align-items: center;
}

.username {
  margin: 0 8px;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .username {
    display: none;
  }
}
</style>
