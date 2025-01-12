<!-- vue-qk-base/src/components/TopHeader.vue -->
<template>
  <el-header height="60px" class="header-container">
    <div class="logo">
      <h1>体育管理系统</h1>
    </div>
    <div class="search-box">
      <el-input
          placeholder="请输入搜索内容"
          v-model="searchInput"
          class="search-input"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
      </el-input>
    </div>
  </el-header>
</template>

<script>
export default {
  name: 'TopHeader',
  data() {
    return {
      searchInput: ''
    };
  },
  methods: {
    handleSearch() {
      this.$message(`执行搜索: ${this.searchInput}`);
      // TODO: 可以自行扩展实际搜索逻辑
    }
  }
};
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  background-color: #2f54eb;
  color: #fff;
  padding: 0 16px;
}

.logo {
  width: 200px;
}

.search-box {
  flex: 1;
  display: flex;
  justify-content: center;
}

.search-input {
  width: 400px;
}
</style>