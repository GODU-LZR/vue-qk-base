<template>
  <div class="login-page">
    <el-row class="login-container" :gutter="0" type="flex">
      <el-col :xs="24" :sm="24" :md="14" :lg="16" class="tech-intro">
        <TechIntro />
      </el-col>
      <el-col :xs="24" :sm="24" :md="10" :lg="8" class="login-form">
        <LoginForm @login="handleLogin" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LoginForm from './LoginForm.vue'
import TechIntro from './TechIntro.vue'

export default {
  name: 'LoginPage',
  components: {
    LoginForm,
    TechIntro
  },
  methods: {
    async handleLogin(userData) {
      const { email, password, verificationCode } = userData;
      if (email === 'admin@example.com' && password === 'admin' && verificationCode === '123456') {
        localStorage.setItem('isLoggedIn', 'true');
        this.$message.success('登录成功');
        try {
          await this.$router.push({
            path: '/',
            replace: true
          });
        } catch (err) {
          if (err.name !== 'NavigationDuplicated') {
            throw err;
          }
        }
      } else {
        this.$message.error('登录失败，请检查邮箱、密码和验证码');
      }
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
