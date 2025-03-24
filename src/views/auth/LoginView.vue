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
      const { email, password, verificationCode } = userData;
      if (email === 'admin@example.com' && password === 'admin' && verificationCode === '123456') {
        // 显示组件内的加载状态
        this.isLoading = true;

        // 设置登录状态
        localStorage.setItem('isLoggedIn', 'true');
        this.$message.success('登录成功');

        try {
          // 创建全局加载遮罩
          this.createGlobalLoadingMask();

          // 添加标记到历史状态，防止刷新循环
          history.replaceState({ justLoggedIn: true }, document.title);

          // 先导航到首页
          await this.$router.push({
            path: '/',
            replace: true
          });

          // 设置一个短暂延迟后刷新页面
          setTimeout(() => {
            // 触发自定义登录完成事件
            window.dispatchEvent(new Event('login-completed'));

            // 直接刷新页面
            window.location.reload();
          }, 300); // 延长一点时间，确保加载遮罩已完全显示

        } catch (err) {
          // 如果发生错误，隐藏加载状态
          this.isLoading = false;

          // 移除全局加载遮罩
          const mask = document.getElementById('global-loading-mask');
          if (mask) document.body.removeChild(mask);

          if (err.name !== 'NavigationDuplicated') {
            throw err;
          }
        }
      } else {
        this.$message.error('登录失败，请检查邮箱、密码和验证码');
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
