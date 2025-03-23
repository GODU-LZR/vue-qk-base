<template>
  <div class="login-container">
    <h3 class="login-title">账号登录</h3>
    <el-form :model="form" label-position="top" class="login-form">
      <el-form-item label="邮箱" :rules="[{ required: true, message: '请输入邮箱', trigger: 'blur' }]">
        <el-input v-model="form.email" prefix-icon="el-icon-message" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="密码" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
        <el-input v-model="form.password" prefix-icon="el-icon-lock" type="password" placeholder="请输入密码" />
      </el-form-item>

      <el-form-item label="验证码" :rules="[{ required: true, message: '请输入验证码', trigger: 'blur' }]">
        <el-row :gutter="10">
          <el-col :span="14">
            <el-input v-model="form.verificationCode" prefix-icon="el-icon-key" placeholder="请输入验证码" />
          </el-col>
          <el-col :span="10">
            <el-button :disabled="isSending" @click="sendVerificationCode" type="primary">
              {{ isSending ? `${countdown}秒后重试` : '获取验证码' }}
            </el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" class="login-button" @click="handleSubmit">登 录</el-button>
      </el-form-item>

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
      countdown: 60
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('login', this.form);
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
      this.countdown = 60;
      this.$message.success('验证码已发送至您的邮箱');

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
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 460px;
}

.login-title {
  font-size: 28px;
  color: #1890ff;
  text-align: center;
  margin-bottom: 40px;
  font-weight: 600;
}

.login-form {
  width: 100%;
  margin: 0 auto;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  margin-top: 10px;
  background: #1890ff;
  border-color: #1890ff;
}

.el-form-item {
  margin-bottom: 25px;
}

:deep(.el-form-item__label) {
  padding-bottom: 8px;
  font-weight: 500;
}

:deep(.el-input__inner) {
  height: 44px;
}

.el-button:not(.login-button) {
  height: 44px;
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
</style>
