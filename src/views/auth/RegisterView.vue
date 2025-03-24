<template>
  <div class="register-page">
    <el-row class="register-container" :gutter="0" type="flex">
      <el-col :xs="24" :sm="24" :md="14" :lg="16" class="tech-intro">
        <TechIntro />
      </el-col>
      <el-col :xs="24" :sm="24" :md="10" :lg="8" class="register-form-col">
        <RegisterForm />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import TechIntro from './components/TechIntro.vue'
import RegisterForm from './components/RegisterForm.vue'

export default {
  name: 'RegisterView',
  components: {
    TechIntro,
    RegisterForm
  }
}
</script>

<style scoped>
.register-page {
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

.register-container {
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

.register-form-col {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 20px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .register-page {
    position: relative;
    height: auto;
    min-height: 100vh;
    width: 100%;
  }

  .register-container {
    flex-direction: column;
    height: auto;
  }

  .tech-intro, .register-form-col {
    height: auto;
  }
}
</style>
