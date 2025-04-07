<template>
  <div class="logo">
    <i class="el-icon-basketball logo-icon"></i>
    <h1 class="logo-text">智能城市体育云平台</h1>
  </div>
</template>

<script>
export default {
  name: 'AppLogo'
}
</script>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  width: 230px;
  cursor: pointer;
}

.logo-icon {
  font-size: 28px;
  margin-right: 10px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .logo-text {
    display: none;
  }

  .logo {
    width: auto;
  }
}
</style>
