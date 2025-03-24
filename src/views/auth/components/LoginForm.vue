<template>
  <div class="login-container">
    <h3 class="login-title">账号登录</h3>
    <el-form :model="form" label-width="60px" class="login-form">
      <el-form-item label="邮箱" :rules="[{ required: true, message: '请输入邮箱', trigger: 'blur' }]">
        <el-input v-model="form.email" prefix-icon="el-icon-message" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="密码" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
        <el-input v-model="form.password" prefix-icon="el-icon-lock" type="password" placeholder="请输入密码" />
      </el-form-item>

      <el-form-item  label="验证码" :rules="[{ required: true, message: '请输入验证码', trigger: 'blur' }]">
        <div class="verification-container">
          <el-input v-model="form.verificationCode" prefix-icon="el-icon-key" placeholder="请输入验证码" />
          <el-button :disabled="isSending" @click="sendVerificationCode" type="primary" class="verification-button">
            {{ isSending ? `${countdown}秒后重试` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>

      <div class="action-buttons">
        <el-button type="primary" class="action-button" @click="handleSubmit">登 录</el-button>
        <el-button type="default" class="action-button" @click="handleRegister">注 册</el-button>
      </div>

      <div class="account-tips">
        <p>超级管理员体验账号: admin@example.com</p>
        <p>默认密码: admin</p>
        <p>验证码: 123456</p>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',
  data() {
    return {
      form: {
        email: '',
        password: '',
        verificationCode: ''
      },
      isSending: false,
      countdown: 120
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('login', this.form);
    },
    handleRegister() {
      this.$router.push('/register');
    },
    sendVerificationCode() {
      if (this.isSending) return;

      // 验证邮箱格式
      if (!this.form.email) {
        this.$message.warning('请先输入邮箱');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.form.email)) {
        this.$message.warning('请输入正确的邮箱格式');
        return;
      }

      this.isSending = true;
      this.countdown = 120;
      this.$message.success('验证码已发送至您的邮箱，请注意查收');

      const timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.isSending = false;
          clearInterval(timer);
        }
      }, 1000);
    }
  }
}
</script>

<style scoped>
.login-container {
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-title {
  font-size: 24px;
  color: #1890ff;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 600;
}

.login-form {
  width: 100%;
  margin: 0 auto;
}

/* 调整标签和输入框的布局 */
:deep(.el-form-item__label) {
  float: left;
  text-align: right;
  line-height: 40px;
  font-weight: 500;
  padding-right: 8px;
  font-size: 13px;
}

:deep(.el-form-item__content) {
  margin-left: 60px !important;
}

/* 验证码布局 */
.verification-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.verification-container .el-input {
  flex: 1;
}

.verification-button {
  height: 40px;
  font-size: 13px;
  padding: 0 8px;
  white-space: nowrap;
  min-width: 110px;
}

/* 按钮组样式 - 移除form-item的边距影响 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 25px;
  margin-bottom: 20px;
  width: 100%;
}

.action-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

:deep(.el-input__inner) {
  height: 40px;
}

.account-tips {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px dashed #e8e8e8;
  font-size: 13px;
  color: #909399;
}

.account-tips p {
  margin: 5px 0;
}

/* 确保按钮样式统一 */
.el-button {
  margin-left: 0 !important;
}
</style>
