<template>
  <el-dropdown trigger="click" @command="handleCommand" class="avatar-dropdown">
    <div class="avatar-container">
      <el-avatar :size="36" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
      <span class="username">{{ userRoleText }}:{{ username }}</span>
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
import { parseToken, logout } from '@/api/modules/auth';

export default {
  name: 'UserMenu',
  data() {
    return {
      userInfo: null
    };
  },
  computed: {
    // 获取用户名
    username() {
      return this.userInfo ? this.userInfo.username : '未登录';
    },

    // 根据角色生成显示文本
    userRoleText() {
      if (!this.userInfo || !this.userInfo.roles) return '访客';

      // 更新角色映射，根据提供的角色码和角色名称表
      const roleMap = {
        'SUPER_ADMIN': '超级管理员',
        'USER_ADMIN': '用户管理员',
        'HR_ADMIN': '人事管理员',
        'VENUE_ADMIN': '场地管理员',
        'EQUIPMENT_ADMIN': '器材管理员',
        'EVENT_ADMIN': '赛事管理员',
        'FINANCE_ADMIN': '财务管理员',
        'FORUM_ADMIN': '论坛管理员',
        'USER': '普通用户'
      };

      // 获取用户的第一个角色
      const primaryRole = this.userInfo.roles[0];

      // 返回角色对应的中文描述，如果没有则返回原始角色代码
      return roleMap[primaryRole] || primaryRole;
    }
  },
  methods: {
    // 从 localStorage 获取 token 并解析用户信息
    getUserInfoFromToken() {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.userInfo = parseToken(token);
        console.log('解析的用户信息:', this.userInfo); // 用于调试
      } else {
        this.userInfo = null;
      }
    },

    async handleCommand(command) {
      if (command === 'logout') {
        try {
          // 使用API登出函数而不是直接清除localStorage
          await logout();

          // 更新本地状态
          this.userInfo = null;

          this.$message.success('已退出登录');

          // 关键修改：使用 replace 而不是 push，避免导航历史记录问题
          this.$router.replace('/login');
        } catch (error) {
          console.error('登出失败:', error);
        }
        return;
      }

      // 发送给父组件处理其他命令
      this.$emit('command', command);
    }
  },
  // 组件创建时获取用户信息
  created() {
    this.getUserInfoFromToken();
  },
  // 组件激活时也重新获取用户信息，以防页面刷新
  activated() {
    this.getUserInfoFromToken();
  }
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
