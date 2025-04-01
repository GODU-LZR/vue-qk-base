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
          <div class="system-title">体育管理系统</div>
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
        // 1. 确保 token 已设置 (假设 LoginForm 或 API 调用已完成)
        if (userData && userData.token) {
          localStorage.setItem('auth_token', userData.token);
          console.log('[LoginView handleLogin] Token 已从 userData 获取并存入 localStorage');
        } else if (!localStorage.getItem('auth_token')) {
          console.error('[LoginView handleLogin] 错误: 未能确认 auth_token 已设置');
          throw new Error('登录处理失败，未找到认证凭证');
        }

        // 2. (已完成) 移除设置 'isLoggedIn'
        console.log('[LoginView handleLogin] (已移除逻辑) 不再设置 localStorage 的 isLoggedIn 标记');

        // 3. 成功消息 (保留)
        this.$message.success('登录成功！准备刷新...');

        // 4. 创建加载遮罩 (保留)
        this.createGlobalLoadingMask();

        // 5. 添加历史状态标记 (保留)
        history.replaceState({ justLoggedIn: true }, document.title);
        console.log('[LoginView handleLogin] 已设置 history.state.justLoggedIn = true');

        // 6. 解析并存储用户信息 (保留)
        // ... (存储 userInfo 到 localStorage 的逻辑) ...

        // *** 7. 移除显式导航 ***
        // console.log('[LoginView handleLogin] 准备导航到首页 /');
        // await this.$router.replace({ path: '/' }); // <-- 移除此行

        // 8. 触发刷新 (保留 reload)
        setTimeout(() => {
          console.log('[LoginView handleLogin] 触发全局 login-completed 事件 (如果需要)');
          window.dispatchEvent(new Event('login-completed')); // 如果 App.vue 监听了这个事件

          // --- 依赖页面刷新来应用登录状态 ---
          console.log('[LoginView handleLogin] 延迟后执行页面刷新以应用登录状态');
          window.location.reload(); // 强制刷新页面
          // --- 刷新逻辑结束 ---

        }, 300); // 保留短暂延迟

      } catch (err) {
        console.error('[LoginView handleLogin] 登录处理过程中发生错误:', err);
        this.isLoading = false; // 隐藏加载状态
        // ... (错误处理，清理 mask 和 token) ...
        this.$message.error(err.message || '登录失败，请重试');
      }
      // 成功时因为页面刷新，不需要 finally 关闭 isLoading
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
