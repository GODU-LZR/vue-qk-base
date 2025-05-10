<template>
  <el-dropdown trigger="click" @command="handleCommand" class="avatar-dropdown">
    <div class="avatar-container">
      <el-avatar :key="avatarUrl" :size="36" :src="avatarUrl" icon="el-icon-user-solid"></el-avatar>
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
// 确保路径正确
import { parseToken, logout } from '@/api/modules/auth/index.js'; // 假设路径正确
import { actions } from '@/qiankun/actions'; // 假设路径正确
import { getCurrentUserAvatarUrl } from '@/api/modules/user/index.js'; // 假设路径正确

export default {
  name: 'UserMenu',
  data() {
    return {
      userInfo: null, // 存储从 Token 解析或全局状态同步的基础信息
      avatarUrl: null, // 单独存储添加了缓存破坏参数的头像 URL
      unregisterGlobalStateChange: null // 用于取消监听
    };
  },
  computed: {
    // 计算属性依赖 this.userInfo
    username() {
      return this.userInfo ? this.userInfo.username : '未登录';
    },
    userRoleText() {
      if (!this.userInfo || !Array.isArray(this.userInfo.roles) || this.userInfo.roles.length === 0) {
        return '访客';
      }
      // 角色映射，根据你的实际情况调整
      const roleMap = {
        'SUPER_ADMIN': '超级管理员', 'USER_ADMIN': '用户管理员', 'HR_ADMIN': '人事管理员',
        'VENUE_ADMIN': '场地管理员', 'EQUIPMENT_ADMIN': '器材管理员', 'EVENT_ADMIN': '赛事管理员',
        'FINANCE_ADMIN': '财务管理员', 'FORUM_ADMIN': '论坛管理员', 'USER': '普通用户', 'VIP_USER': '会员用户'
      };
      const primaryRole = this.userInfo.roles[0]; // 可以根据需要选择显示哪个角色
      return roleMap[primaryRole] || primaryRole;
    }
  },
  methods: {
    // --- 方法：用于获取头像 URL (添加了缓存破坏逻辑) ---
    async fetchAvatarUrl() {
      // 只有在有用户信息 (已登录) 时才去获取头像
      if (!this.userInfo) {
        console.log('[UserMenu] 没有用户信息，跳过获取头像。');
        this.avatarUrl = null; // 确保用户未登录时头像为空
        return;
      }
      console.log('[UserMenu] 正在为用户获取头像 URL:', this.userInfo.username);
      // this.avatarUrl = null; // 可选：获取期间显示默认图标
      try {
        const url = await getCurrentUserAvatarUrl(); // 调用 API 获取原始 URL
        if (url && typeof url === 'string' && url.trim() !== '') {
          // --- 关键改动：添加缓存破坏参数 ---
          try {
            const cacheBustedUrl = new URL(url);
            cacheBustedUrl.searchParams.set('_t', Date.now()); // 添加时间戳
            this.avatarUrl = cacheBustedUrl.toString();
            console.log('[UserMenu] 头像 URL 设置为 (带缓存破坏):', this.avatarUrl);
          } catch(e) {
            // 如果 API 返回的 URL 格式无效导致 new URL() 失败
            console.warn('[UserMenu] 获取到的头像 URL 格式无效，无法添加缓存破坏参数:', url, e);
            this.avatarUrl = url; // 降级使用原始 URL
            console.log('[UserMenu] 头像 URL 设置为 (原始，格式可能有误):', this.avatarUrl);
          }
          // ---------------------------------
        } else {
          console.log('[UserMenu] API 未返回有效的头像 URL，将使用默认图标。');
          this.avatarUrl = null;
        }
      } catch (error) {
        console.error('[UserMenu] 调用 getCurrentUserAvatarUrl API 时出错:', error);
        this.avatarUrl = null; // 出错时也使用默认图标
      }
    },

    // --- 方法：用于从 Token 初始化用户信息 ---
    initializeUserInfoFromToken() {
      console.log('[UserMenu] 尝试从 Token 初始化用户信息...');
      this.userInfo = null; // 先重置
      this.avatarUrl = null;
      const token = localStorage.getItem('auth_token'); // 请使用你项目中实际存储 Token 的 Key

      if (token) {
        try {
          const parsedInfo = parseToken(token); // 调用你的 Token 解析函数
          if (parsedInfo) {
            this.userInfo = parsedInfo; // 设置组件的 userInfo
            console.log('[UserMenu] 从 Token 成功解析初始用户信息:', JSON.parse(JSON.stringify(this.userInfo)));
            return true; // 表示成功获取
          } else {
            console.warn('[UserMenu] 找到 Token 但解析失败 (可能无效或格式错误)。');
            localStorage.removeItem('auth_token'); // 清理无效 Token
            return false;
          }
        } catch(e) {
          console.error('[UserMenu] 解析 Token 时发生错误:', e);
          localStorage.removeItem('auth_token'); // 清理可能导致错误的 Token
          return false;
        }
      } else {
        console.log('[UserMenu] 初始化时未找到 Token。');
        return false;
      }
    },

    // --- 清理用户状态的方法 ---
    clearUserInfoAndAvatar() {
      console.log('[UserMenu] 清理用户信息和头像 URL。');
      this.userInfo = null;
      this.avatarUrl = null;
    },

    // --- 处理下拉菜单命令 ---
    async handleCommand(command) {
      if (command === 'logout') {
        console.log('[UserMenu] 执行登出操作...');
        try {
          await logout(); // 调用后端登出接口
          this.$message.success('已成功退出登录');
        } catch (error) {
          console.error('调用后端登出接口时发生错误 (将继续前端登出流程):', error);
          // 即使后端接口失败，前端也应继续执行登出流程
          this.$message.warning('与服务器通信断开，已在本地登出。');
        } finally {
          // --- 关键：确保清理所有相关全局状态 ---
          actions.setGlobalState({
            isLoggedIn: false,
            token: null,
            userInfo: null,
            refreshAvatarTrigger: null // 清理可能存在的触发器
          });
          // 清理本地状态
          this.clearUserInfoAndAvatar();
          // 跳转到登录页
          this.$router.replace('/login').catch(err => {
            if (err.name !== 'NavigationDuplicated') { console.error('Logout navigation error:', err); }
          });
        }
        return; // 退出函数
      }

      // 处理其他命令
      if (command === 'profile') {
        console.log('[UserMenu] 导航到个人中心...');
        // 假设子应用路由基础是 /user 或直接是 /profile
        this.$router.push('/user/profile').catch(err => { // 根据你的路由配置调整路径
          if (err.name !== 'NavigationDuplicated') { console.error('Profile navigation error:', err); }
        });
      } else if (command === 'settings') {
        console.log('[UserMenu] 点击了系统设置 (暂未实现跳转)');
        this.$message.info('系统设置功能待开发');
        // this.$router.push('/settings');
      } else {
        // 传递其他未知命令
        console.log('[UserMenu] 处理未知命令:', command);
        this.$emit('command', command);
      }
    }
  },

  // --- created 钩子 ---
  created() {
    console.log('[UserMenu] 组件创建 (created hook)');

    // 1. 执行初始化：尝试从 Token 获取基础信息
    const initialized = this.initializeUserInfoFromToken();

    // 2. 如果从 Token 成功获取到 userInfo，则立即调用 API 获取头像
    if (initialized) {
      this.fetchAvatarUrl(); // 获取初始头像
    } else {
      this.avatarUrl = null; // 确保未登录时 avatarUrl 为 null
    }

    // 3. 设置全局状态监听器
    console.log('[UserMenu] 设置全局状态监听器...');
    if (typeof actions.onGlobalStateChange !== 'function') {
      console.error('[UserMenu] qiankun actions.onGlobalStateChange 不是一个函数！无法监听全局状态。');
      return; // 如果 actions 无效，则不设置监听器
    }
    this.unregisterGlobalStateChange = actions.onGlobalStateChange((state, prev) => {
      console.log('[UserMenu] 全局状态监听器触发。');
      // 可以在这里打印 state 和 prev 进行详细调试
      // console.log('  新状态 (state):', JSON.parse(JSON.stringify(state)));
      // console.log('  旧状态 (prev):', JSON.parse(JSON.stringify(prev)));

      let needsAvatarRefresh = false;
      const previousUserId = prev.userInfo?.userId; // 使用可选链安全访问旧 ID
      const currentUserId = state.userInfo?.userId; // 使用可选链安全访问新 ID

      // 深比较 userInfo 对象是否真的改变，避免不必要的刷新
      // 注意：简单的 JSON.stringify 可能因键顺序不同导致误判，但对于简单对象通常足够
      const newUserInfoJson = JSON.stringify(state.userInfo);
      const oldLocalUserInfoJson = JSON.stringify(this.userInfo);

      // 条件 1: 用户信息对象本身发生了变化 (内容不同)
      if (newUserInfoJson !== oldLocalUserInfoJson) {
        console.log('[UserMenu] 检测到全局 userInfo 与本地 userInfo 内容不同，准备更新。');
        // 更新本地 userInfo
        this.userInfo = state.userInfo ? { ...state.userInfo } : null; // 使用浅拷贝创建一个新对象，或直接赋值
        // 如果 userInfo 变为 null (登出)，则不需要刷新头像；否则需要刷新
        if (this.userInfo) {
          needsAvatarRefresh = true;
          console.log('  > 本地 userInfo 已更新，标记需要刷新头像。');
        } else {
          console.log('  > 全局 userInfo 变为 null (登出)，清理本地头像。');
          this.avatarUrl = null; // 用户登出，清除头像
          needsAvatarRefresh = false; // 不需要再去 fetch
        }
      }

      // 条件 2: 用户 ID 发生变化 (适用于登录切换用户，或者从无到有)
      // 这个条件可能与上面条件1部分重叠，但更明确地捕捉用户身份变化
      if (currentUserId && currentUserId !== previousUserId) {
        console.log(`[UserMenu] 检测到用户 ID 变化 (从 ${previousUserId || '无'} 到 ${currentUserId})，标记需要刷新头像。`);
        needsAvatarRefresh = true;
      }

      // 条件 3: 收到明确的头像刷新信号 (如果全局状态中有定义 refreshAvatarTrigger)
      // 假设 refreshAvatarTrigger 是一个时间戳或计数器
      if (state.refreshAvatarTrigger && state.refreshAvatarTrigger !== prev.refreshAvatarTrigger) {
        console.log('[UserMenu] 检测到头像刷新触发器 (refreshAvatarTrigger) 变化，标记需要刷新头像。');
        needsAvatarRefresh = true;
      }

      // --- 执行刷新 ---
      // 最终判断：如果标记了需要刷新，并且当前确认有用户信息（用户已登录状态）
      if (needsAvatarRefresh && this.userInfo) {
        console.log('[UserMenu] 条件满足，调用 fetchAvatarUrl 获取最新头像...');
        this.fetchAvatarUrl();
      } else if (needsAvatarRefresh && !this.userInfo) {
        // 这通常发生在条件1中登出的情况，上面已经处理了 avatarUrl = null
        console.log('[UserMenu] 标记了需要刷新，但当前无用户信息 (已登出)，跳过 fetchAvatarUrl。');
      } else {
        console.log('[UserMenu] 无需刷新头像或用户已登出。');
      }

    }, true); // true: 立即执行一次回调，用初始全局状态同步组件状态
    console.log('[UserMenu] 全局状态监听器设置完成。');
  },

  // --- beforeDestroy 钩子 ---
  beforeDestroy() {
    console.log('[UserMenu] 组件销毁 (beforeDestroy hook)');
    // 清理监听器，防止内存泄漏
    if (typeof this.unregisterGlobalStateChange === 'function') {
      this.unregisterGlobalStateChange(); // 调用取消函数
      this.unregisterGlobalStateChange = null; // 解除引用
      console.log('[UserMenu] 全局状态监听器已成功注销。');
    } else {
      console.log('[UserMenu] 未找到有效的全局状态监听器注销函数。');
    }
  }
}
</script>

<style scoped>
.avatar-dropdown {
  margin-left: 15px; /* 下拉菜单与其他元素的间距 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
  height: 100%; /* 使其占满父容器高度，便于垂直居中 */
  display: flex;
  align-items: center; /* 垂直居中内容 */
}

.avatar-container {
  display: flex;
  align-items: center; /* 垂直居中头像、用户名和箭头 */
  outline: none; /* 移除可能的焦点轮廓 */
}

.username {
  margin: 0 8px; /* 用户名左右边距 */
  font-size: 14px; /* 用户名文字大小 */
  color: #303133; /* 用户名颜色，可根据主题调整 */
  white-space: nowrap; /* 防止用户名换行 */
  max-width: 150px; /* 限制最大宽度，防止过长 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
}

.el-icon--right {
  margin-left: 0; /* 移除 Element UI 默认的左边距 */
  transition: transform 0.3s; /* 为箭头添加旋转过渡效果 */
}

/* 当下拉菜单展开时旋转箭头 (可选) */
.avatar-dropdown[aria-expanded="true"] .el-icon--right {
  transform: rotate(180deg);
}


/* 针对小屏幕隐藏用户名 (可选) */
@media (max-width: 768px) {
  .username {
    display: none; /* 在小屏幕上隐藏用户名 */
  }
  .avatar-dropdown {
    margin-left: 10px; /* 调整小屏幕下的左边距 */
  }
}

/* 可以为下拉菜单项本身添加一些样式 */
.user-dropdown-menu i {
  margin-right: 8px; /* 图标和文字的间距 */
  vertical-align: middle; /* 图标垂直居中 */
}

.el-dropdown-menu__item--divided {
  margin-top: 6px; /* 分割线上方间距 */
  border-top: 1px solid #EBEEF5; /* 分割线样式 */
}
.el-dropdown-menu__item--divided:before {
  /* Element UI 可能自带 :before 分割线，如果需要自定义，先隐藏默认的 */
  content: none;
}
</style>