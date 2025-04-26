<template>
  <div class="register-form-wrapper">
    <h3 class="register-title">账号注册</h3>

    <div class="avatar-container">
      <img v-if="form.avatar" :src="form.avatar" class="avatar" alt="">
      <div v-else class="avatar-placeholder">
        <i class="el-icon-user-solid"></i>
      </div>
    </div>

    <el-form :model="form" :rules="rules" ref="registerForm" label-width="80px" class="register-form">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" prefix-icon="el-icon-message" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" prefix-icon="el-icon-user" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="form.realName" prefix-icon="el-icon-user" placeholder="请输入真实姓名" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" prefix-icon="el-icon-lock" type="password" placeholder="请输入密码" />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" prefix-icon="el-icon-lock" type="password" placeholder="请确认密码" />
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
        <el-button type="primary" class="action-button" @click="handleRegisterSubmit">注 册</el-button>
        <el-button type="default" class="action-button" @click="goToLogin">返回登录</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { register } from '@/api/modules/auth';
import { sendVerificationCode } from '@/api/modules/notification';

export default {
  name: 'RegisterForm',
  data() {
    // 自定义验证规则 (保持不变)
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else if (value.length < 6) {
        callback(new Error('密码长度不能小于6位'));
      } else {
        if (this.form.confirmPassword !== '') {
          this.$refs.registerForm.validateField('confirmPassword');
        }
        callback();
      }
    };
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    };

    return {
      form: {
        email: '',
        username: '',
        realName: '',
        password: '',
        confirmPassword: '',
        verificationCode: '',
        avatar: '' // 用于存储生成的 DiceBear 头像 URL
      },
      rules: { // 移除了 avatar 的 required 规则
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change']}
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '真实姓名长度在2到20个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ],
        verificationCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 6, max: 6, message: '验证码长度为6位', trigger: 'blur' }
        ]
      },
      isSending: false,
      countdown: 120
    }
  },
  computed: {
    /**
     * 计算邮箱地址是否有效
     * 用于控制“获取验证码”按钮的禁用状态
     */
    isEmailValid() {
      // 如果 form.email 为空，则无效
      if (!this.form.email || this.form.email.trim() === '') {
        return false;
      }
      // 使用正则表达式校验邮箱格式
      // 这个是比较常用的简单正则，可以根据需要调整
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.form.email);
    }
  },
  watch: { // 监听 username 变化 (保持不变)
    'form.username'(newUsername) {
      this.updateAvatar(newUsername);
    }
  },
  methods: {
    updateAvatar(username) { // 更新头像的方法 (保持不变)
      if (username && username.trim().length > 0) {
        const initials = username.trim().substring(0, 2);
        this.form.avatar = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(initials)}`;
        console.log('Generated DiceBear Avatar URL:', this.form.avatar);
      } else {
        this.form.avatar = '';
      }
    },
    async handleSendCode() {
      // 现在可以直接使用 this.isEmailValid
      if (this.isSending || !this.isEmailValid) {
        if (!this.isEmailValid && this.form.email) { // 如果是因为格式无效
          this.$message.warning('请输入正确的邮箱格式');
        } else if (!this.form.email) { // 如果是没输入
          this.$message.warning('请先输入邮箱');
        }
        return;
      }
      // ... 后续发送逻辑不变 ...
      this.isSending = true;
      this.countdown = 120;
      let timer = null;
      try {
        const result = await sendVerificationCode(this.form.email);
        if (result.success) {
          this.$message.success('验证码已发送至您的邮箱，请注意查收');
          timer = setInterval(() => {
            if (this.countdown > 0) { this.countdown--; }
            else { this.isSending = false; clearInterval(timer); }
          }, 1000);
        } else {
          this.$message.error(result.message || '发送验证码失败');
          this.isSending = false;
        }
      } catch (error) {
        console.error("Send code error caught in component:", error);
        this.$message.error(error.message || '发送验证码时出错');
        this.isSending = false;
        if (timer) clearInterval(timer);
      }
    },
    // --- 处理注册提交 ---
    async handleRegisterSubmit() { // 重命名并改为 async
      try {
        // 1. 表单验证
        const valid = await this.$refs.registerForm.validate();
        if (!valid) {
          this.$message.error('请检查并完善注册信息');
          return;
        }

        // 2. 确保头像生成
        if (!this.form.avatar && this.form.username.trim().length > 0) {
          this.updateAvatar(this.form.username);
        }
        console.log('准备提交注册信息，包含头像 URL:', this.form.avatar);

        // 3. 设置加载状态
        this.isRegistering = true;

        // 4. 准备数据 (已包含 verifyCode)
        const registrationData = {
          email: this.form.email,
          username: this.form.username,
          realName: this.form.realName,
          password: this.form.password,
          verifyCode: this.form.verificationCode, // 从表单获取
          avatar: this.form.avatar
        };

        // 5. 调用注册 API
        const result = await register(registrationData);

        // 6. 处理结果
        if (result.success) {
          this.$message.success('注册成功！请前往登录页面登录,默认头像已根据用户名生成，登录后可在个人中心修改。');
          // 跳转到登录页
          setTimeout(() => {
            this.$router.push('/login');
          }, 1000); // 延迟跳转给用户看消息时间
        } else {
          // API 调用成功但业务失败（例如验证码错误），显示后端返回的消息
          this.$message.error(result.message || '注册失败，请检查输入');
        }
      } catch (error) {
        // API 调用本身失败 (网络错误或拦截器 reject 的其他错误)
        console.error("注册过程中发生错误:", error);
        // error 对象可能已包含 message (来自拦截器)
        this.$message.error(error.message || '注册过程中发生未知错误');
      } finally {
        // 7. 结束加载状态
        this.isRegistering = false;
      }
    },
    goToLogin() { // (保持不变)
      this.$router.push('/login');
    },

    // 头像上传方法已移除
  }
}
</script>

<style scoped>
.register-form-wrapper {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.register-title {
  margin-top: 75px;
  font-size: 24px;
  color: #1890ff;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 600;
}

/* 头像展示区域样式 */
.avatar-container {
  text-align: center;
  margin-bottom: 25px;
  height: 100px; /* 固定高度 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 实际头像 (<img> 标签) 样式 */
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%; /* 圆形 */
  display: block;
  object-fit: cover;
  border: 1px solid #eee;
}

/* 头像占位符样式 (恢复使用 div + i) */
.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%; /* 圆形 */
  background-color: #f0f2f5; /* 浅灰色背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed #d9d9d9; /* 虚线边框 */
}

.avatar-placeholder i {
  font-size: 40px; /* 图标大小 */
  color: #8c939d; /* 图标颜色 */
}


.register-form {
  width: 100%;
  margin: 0 auto;
}

:deep(.el-form-item__label) {
  float: left;
  text-align: right;
  line-height: 40px;
  font-weight: 500;
  padding-right: 8px;
  font-size: 13px;
}

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

.el-button {
  margin-left: 0 !important;
}
</style>