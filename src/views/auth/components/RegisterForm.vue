<template>
  <div class="register-form-wrapper">
    <h3 class="register-title">账号注册</h3>

    <!-- 头像上传和展示区域 -->
    <div class="avatar-container">
      <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :http-request="handleAvatarUpload">
        <img v-if="form.avatar" :src="form.avatar" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
      <div class="upload-hint">点击上传头像</div>
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
          <el-button :disabled="isSending" @click="sendVerificationCode" type="primary" class="verification-button">
            {{ isSending ? `${countdown}秒后重试` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>

      <div class="action-buttons">
        <el-button type="primary" class="action-button" @click="handleRegister">注 册</el-button>
        <el-button type="default" class="action-button" @click="goToLogin">返回登录</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'RegisterForm',
  data() {
    // 自定义验证规则
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
        avatar: '' // 用于存储头像的base64数据或URL
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
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
        ],
        avatar: [
          { required: true, message: '请上传头像', trigger: 'change' }
        ]
      },
      isSending: false,
      countdown: 120
    }
  },
  methods: {
    handleRegister() {
      this.$refs.registerForm.validate((valid) => {
        if (valid) {
          if (!this.form.avatar) {
            this.$message.warning('请上传头像');
            return false;
          }

          // 模拟注册
          this.$message.success('注册成功，请登录');
          setTimeout(() => {
            this.$router.push('/login');
          }, 1500);
        } else {
          this.$message.error('请完善注册信息');
          return false;
        }
      });
    },
    goToLogin() {
      this.$router.push('/login');
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
    },
    // 头像上传前的校验
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isPNG = file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG && !isPNG) {
        this.$message.error('头像只能是JPG或PNG格式!');
        return false;
      }
      if (!isLt2M) {
        this.$message.error('头像大小不能超过2MB!');
        return false;
      }
      return true;
    },
    // 处理头像上传
    handleAvatarUpload(options) {
      const file = options.file;
      // 使用FileReader将图片转为base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.avatar = reader.result;
      };
    }
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

/* 头像上传区域样式 */
.avatar-container {
  text-align: center;
  margin-bottom: 25px;
}

.avatar-uploader {
  display: inline-block;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border-radius: 10px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  display: block;
  object-fit: cover;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.register-form {
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

/* 按钮组样式 */
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

/* 确保按钮样式统一 */
.el-button {
  margin-left: 0 !important;
}

@media (max-width: 768px) {
  .avatar-uploader-icon, .avatar {
    width: 80px;
    height: 80px;
    line-height: 80px;
  }
}
</style>
