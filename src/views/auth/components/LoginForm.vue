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
          <el-button :disabled="isSending || !isEmailValid" @click="handleSendCode" type="primary" class="verification-button">
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
        <p>验证码: 123456 </p>
      </div>
    </el-form>
  </div>
</template>

<script>
// 1. 导入需要的 API 函数
import { login } from '@/api/modules/auth';
import { sendVerificationCode } from '@/api/modules/notification';

export default {
  name: 'LoginForm',
  data() {
    return {
      form: {
        email: '',
        password: '',
        verificationCode: '' // 确保表单数据包含验证码
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] } // 增加 change 触发
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          // 注意：后端密码通常有长度要求，但前端规则可以宽松些，以实际需要为准
          { min: 5, message: '密码长度不能少于5个字符', trigger: 'blur' }
        ],
        verificationCode: [ // 确保验证码是必填项
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 6, max: 6, message: '验证码长度为6位', trigger: 'blur' } // 根据实际验证码长度调整
        ]
      },
      isSending: false, // 验证码发送中状态
      countdown: 120,   // 倒计时秒数
      isSubmitting: false // 登录按钮 loading 状态
    }
  },
  // 2. 添加计算属性用于按钮禁用判断
  computed: {
    isEmailValid() {
      if (!this.form.email) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.form.email);
    }
  },
  methods: {
    // 3. 实现登录提交逻辑
    async handleSubmit() {
      try {
        // a. 表单验证
        const valid = await this.$refs.loginForm.validate();
        if (!valid) {
          this.$message.error('请检查输入项是否正确');
          return;
        }

        // b. 设置加载状态
        this.isSubmitting = true;

        // c. 调用登录 API (传入 email, password, verificationCode)
        const result = await login(
            this.form.email,
            this.form.password,
            this.form.verificationCode // 传递验证码
        );

        // d. 处理登录结果
        if (result.success && result.data && result.data.token) {
          // 登录成功，login API 内部已处理 localStorage
          // 触发 login 事件给父组件 (通常是 LoginView.vue)
          this.$emit('login', {
            email: this.form.email,
            userId: result.data.userId, // 从返回的 data 中获取
            token: result.data.token   // 从返回的 data 中获取
          });
          // 登录成功提示和跳转逻辑通常由父组件处理，这里不再显示 $message.success
        } else {
          // API 调用成功但业务失败 (验证码错误、密码错误等)
          this.$message.error(result.message || '登录失败，请检查输入');
        }
      } catch (error) {
        // API 调用本身失败 (网络错误或拦截器 reject)
        console.error("登录过程中发生错误:", error);
        this.$message.error(error.message || '登录过程中发生未知错误');
      } finally {
        // e. 结束加载状态
        this.isSubmitting = false;
      }
    },

    // 4. 实现发送验证码逻辑
    async handleSendCode() { // 使用 handleSendCode 名称
      // 检查是否正在发送或邮箱无效
      if (this.isSending || !this.isEmailValid) {
        if (!this.isEmailValid && this.form.email) {
          this.$message.warning('请输入正确的邮箱格式');
        } else if (!this.form.email) {
          this.$message.warning('请先输入邮箱');
        }
        return;
      }

      this.isSending = true;
      this.countdown = 120;
      let timer = null;

      try {
        // 调用发送验证码 API
        const result = await sendVerificationCode(this.form.email);

        if (result.success) {
          this.$message.success('验证码已发送至您的邮箱，请注意查收');
          // 启动倒计时
          timer = setInterval(() => {
            if (this.countdown > 0) {
              this.countdown--;
            } else {
              this.isSending = false;
              clearInterval(timer);
            }
          }, 1000);
        } else {
          // API 调用成功但业务失败
          this.$message.error(result.message || '发送验证码失败');
          this.isSending = false; // 重置按钮状态
        }
      } catch (error) {
        // API 调用本身失败
        console.error("Send code error caught in component:", error);
        this.$message.error(error.message || '发送验证码时出错');
        this.isSending = false; // 重置按钮状态
        if (timer) clearInterval(timer); // 确保清除计时器
      }
    },

    // 5. 注册按钮跳转逻辑 (保持不变)
    handleRegister() {
      this.$router.push('/register');
    },
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
