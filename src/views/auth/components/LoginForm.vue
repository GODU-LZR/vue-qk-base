<template>
  <div class="login-container">
    <h3 class="login-title">账号登录</h3>
    <el-form
        ref="loginForm"
        :model="form"
        :rules="rules"
        label-width="60px"
        class="login-form">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" prefix-icon="el-icon-message" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" prefix-icon="el-icon-lock" type="password" placeholder="请输入密码" />
      </el-form-item>

      <el-form-item label="验证码" prop="verificationCode">
        <div class="verification-container">
          <el-input v-model="form.verificationCode" prefix-icon="el-icon-key" placeholder="请输入验证码" />
          <el-button :disabled="isSending" @click="sendVerificationCode" type="primary" class="verification-button">
            {{ isSending ? `${countdown}秒后重试` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>

      <div class="action-buttons">
        <el-button type="primary" class="action-button" @click="handleSubmit" :loading="isSubmitting">登 录</el-button>
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
import { login } from '@/api/modules/auth';

export default {
  name: 'LoginForm',
  data() {
    return {
      form: {
        email: '',
        password: '',
        verificationCode: ''
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, message: '密码长度不能少于5个字符', trigger: 'blur' }
        ],
        verificationCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ]
      },
      isSending: false,
      countdown: 120,
      isSubmitting: false
    }
  },
  methods: {
    async handleSubmit() {
      try {
        // 表单验证
        await this.$refs.loginForm.validate();

        this.isSubmitting = true;

        // 调用登录接口
        const result = await login(this.form.email, this.form.password);

        if (result.success) {
          // 登录成功，向父组件传递登录信息
          this.$emit('login', {
            ...this.form,
            userId: result.data.userId,
            token: localStorage.getItem('auth_token')
          });
        } else {
          // 登录失败
          this.$message.error(result.message || '登录失败，请检查账号密码');
        }
      } catch (error) {
        if (error.message) {
          this.$message.error(error.message);
        }
      } finally {
        this.isSubmitting = false;
      }
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

      // 这里可以调用发送验证码的API
      // sendVerificationCodeApi(this.form.email);

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
