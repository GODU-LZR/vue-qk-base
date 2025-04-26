<template>
  <el-dropdown trigger="click" @command="handleCommand" class="avatar-dropdown">
    <div class="avatar-container">
      <el-avatar :size="36" :src="avatarUrl" icon="el-icon-user-solid"></el-avatar>
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
import { actions } from '@/qiankun/actions'; // 导入共享的 actions
import { getCurrentUserAvatarUrl } from '@/api/modules/user'; // 导入获取头像的 API

export default {
  name: 'UserMenu',
  data() {
    return {
      userInfo: null,
      avatarUrl: null // 2. 新增数据属性存储头像 URL
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
    // 3. 修改：现在只解析 token，不直接处理头像
    getUserInfoFromToken() {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.userInfo = parseToken(token);
        console.log('[UserMenu] 解析的用户信息:', this.userInfo);
        // 在获取用户信息后，触发获取头像
        this.fetchAvatarUrl(); // <--- 在这里调用
      } else {
        this.userInfo = null;
        this.avatarUrl = null; // 用户信息为空时，头像也置空
      }
    },

    // 4. 新增：获取头像 URL 的方法
    async fetchAvatarUrl() {
      console.log('[UserMenu] Fetching avatar URL...');
      this.avatarUrl = null; // 先重置一下，避免显示旧头像
      const url = await getCurrentUserAvatarUrl();
      if (url) {
        this.avatarUrl = url;
        console.log('[UserMenu] Avatar URL set to:', url);
      } else {
        console.log('[UserMenu] No valid avatar URL received.');
        // avatarUrl 保持 null，el-avatar 会显示默认图标
      }
    },

    async handleCommand(command) { // (登出逻辑保持不变)
      if (command === 'logout') {
        try {
          await logout();
          console.log('[UserMenu handleCommand] 登出成功，更新全局状态');
          actions.setGlobalState({ isLoggedIn: false, token: null, userInfo: null });
          this.userInfo = null;
          this.avatarUrl = null; // 登出时清除头像 URL
          this.$message.success('已退出登录');
          this.$router.replace('/login');
        } catch (error) {
          console.error('登出过程中发生错误:', error);
          this.$message.error(error.message || '登出失败');
          console.log('[UserMenu handleCommand] 登出失败，强制更新全局状态为登出');
          actions.setGlobalState({ isLoggedIn: false, token: null, userInfo: null });
          this.userInfo = null;
          this.avatarUrl = null; // 登出失败也清除
          this.$router.replace('/login');
        }
        return;
      }
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
