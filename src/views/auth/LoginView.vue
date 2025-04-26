<template>
  <div class="login-page">
    <el-row class="login-container" :gutter="0" type="flex">
      <el-col :xs="24" :sm="24" :md="14" :lg="16" class="tech-intro">
        <TechIntro />
      </el-col>
      <el-col :xs="24" :sm="24" :md="10" :lg="8" class="login-form">
        <LoginForm @login="handleLogin" @register="handleRegister" />
      </el-col>
    </el-row>

    <!-- 添加自定义加载遮罩层 -->
    <transition name="fade">
      <div v-if="isLoading" class="custom-loading-mask">
        <div class="loading-content">
          <i class="el-icon-basketball"></i>
          <div class="system-title">智能城市体育云平台</div>
          <div class="loading-text">加载中，请稍候...</div>
          <div class="loading-spinner"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import LoginForm from './components/LoginForm.vue'
import TechIntro from './components/TechIntro.vue'
import { parseToken, isTokenValid } from '@/api/modules/auth';
import { actions } from '@/qiankun/actions'; // 导入共享的 actions

export default {
  name: 'LoginView',
  components: {
    LoginForm,
    TechIntro
  },
  data() {
    return {
      isLoading: false
    }
  },
  created() {
    console.log('[LoginView created] 登录视图组件实例已创建');
    // *** 检查逻辑已使用 isTokenValid (保持不变) ***
    if (isTokenValid()) {
      console.log('[LoginView created] 检测到有效 Token, 用户已登录，准备跳转首页');
    } else {
      console.log('[LoginView created] 未检测到有效 Token 或 Token 已过期');
    }
  },
  methods: {
    // 创建全屏加载遮罩
    createGlobalLoadingMask() {
      // 检查是否已存在遮罩
      if (document.getElementById('global-loading-mask')) {
        return;
      }

      // 创建遮罩元素
      const mask = document.createElement('div');
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
        transition: opacity 0.3s;
      `;

      // 添加加载图标和文字
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

      // 将遮罩添加到body
      document.body.appendChild(mask);

      // 添加到localStorage以便在刷新后检测
      localStorage.setItem('showLoadingMask', 'true');

      return mask;
    },

    async handleLogin(userData) {
      console.log('[LoginView handleLogin] 开始处理登录, 收到数据:', userData);
      this.isLoading = true;

      try {
        // 1. 确保 token 已设置
        let currentToken = localStorage.getItem('auth_token');
        if (!currentToken) {
          if (userData && userData.token) {
            localStorage.setItem('auth_token', userData.token);
            currentToken = userData.token;
            console.log('[LoginView handleLogin] Token 已从 userData 获取并存入 localStorage');
          } else {
            console.error('[LoginView handleLogin] 错误: 未能确认 auth_token 已设置');
            throw new Error('登录处理失败，未找到认证凭证');
          }
        } else {
          console.log('[LoginView handleLogin] 检测到 localStorage 中已存在 Token');
        }

        // *** 新增：解析用户信息并更新全局状态 ***
        const currentUserInfo = parseToken(currentToken);
        if (currentUserInfo) {
          console.log('[LoginView handleLogin] 解析用户信息成功, 更新全局状态:', currentUserInfo);
          actions.setGlobalState({
            isLoggedIn: true,
            token: currentToken,
            userInfo: currentUserInfo
          });
        } else {
          // 如果 token 解析失败（理论上不应该在这里发生，因为 login API 应该保证返回有效 token）
          console.error('[LoginView handleLogin] 警告: Token 解析失败，无法更新全局用户信息');
          // 也可以选择只更新登录状态和 token
          actions.setGlobalState({
            isLoggedIn: true, // 标记为已登录
            token: currentToken,
            userInfo: null // 用户信息未知
          });
        }
        // *** 新增结束 ***

        // 2. (已完成) 移除设置 'isLoggedIn'
        // ...

        // 3. 成功消息
        this.$message.success('登录成功！准备刷新...');

        // 4. 创建加载遮罩
        this.createGlobalLoadingMask();

        // 5. 添加历史状态标记
        history.replaceState({ justLoggedIn: true }, document.title);
        console.log('[LoginView handleLogin] 已设置 history.state.justLoggedIn = true');

        // 6. 解析并存储用户信息 (上面已处理，这里无需重复)

        // 7. 移除显式导航 (保持不变)

        // 8. 触发刷新
        setTimeout(() => {
          console.log('[LoginView handleLogin] 触发全局 login-completed 事件 (如果需要)');
          window.dispatchEvent(new Event('login-completed'));

          console.log('[LoginView handleLogin] 延迟后执行页面刷新以应用登录状态');
          window.location.reload(); // 刷新

        }, 300);

      } catch (err) {
        console.error('[LoginView handleLogin] 登录处理过程中发生错误:', err);
        this.isLoading = false;

        // *** 新增：登录失败时也确保全局状态为登出 ***
        actions.setGlobalState({
          isLoggedIn: false,
          token: null,
          userInfo: null
        });
        // *** 新增结束 ***

        // ... (错误处理，清理 mask 和 token) ...
        // 移除遮罩的逻辑应该在这里添加
        const mask = document.getElementById('global-loading-mask');
        if (mask) document.body.removeChild(mask);
        localStorage.removeItem('showLoadingMask'); // 清理标记
        localStorage.removeItem('auth_token'); // 确保失败时token被清理

        this.$message.error(err.message || '登录失败，请重试');
      }
    },
    handleRegister() {
      this.$router.push('/register');
    }
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-container {
  width: 100%;
  height: 100%;
  margin: 0;
  background: white;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.tech-intro {
  height: 100%;
  padding: 0;
}

.login-form {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 20px;
}

/* 自定义加载遮罩样式 */
.custom-loading-mask {
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
}

.loading-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.el-icon-basketball {
  font-size: 40px;
  color: #ffffff;
  margin-bottom: 15px;
}

.system-title {
  font-size: 24px;
  color: #ffffff;
  font-weight: bold;
  margin-bottom: 5px;
}

.loading-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top: 5px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .login-page {
    position: relative;
    height: auto;
    min-height: 100vh;
    width: 100%;
  }

  .login-container {
    flex-direction: column;
    height: auto;
  }

  .tech-intro, .login-form {
    height: auto;
  }
}
</style>
