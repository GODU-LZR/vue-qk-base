<template>
  <div class="search-box">
    <el-input
        placeholder="搜索场地、赛事、人员..."
        v-model="searchInput"
        class="search-input"
        prefix-icon="el-icon-search"
        @keyup.enter.native="handleSearch"
    >
      <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
    </el-input>
  </div>
</template>

<script>
export default {
  name: 'SearchBox',
  data() {
    return {
      searchInput: ''
    }
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.searchInput);
    }
  }
}
</script>

<style scoped>
.search-box {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
  margin: 0 20px;
}

.search-input {
  width: 100%;
  border-radius: 4px;
}

:deep(.el-input__inner) {
  height: 36px;
  line-height: 36px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
}

:deep(.el-input-group__append) {
  border: none;
  background-color: #1d4ed8;
  color: white;
}

@media (max-width: 768px) {
  .search-box {
    max-width: none;
  }
}
</style>
