<template>
  <div class="checkin-btn" @click="$emit('show-checkin')">
    <i class="el-icon-medal"></i>
    <span class="checkin-text">运动打卡</span>
  </div>
</template>

<script>
export default {
  name: 'CheckinButton'
}
</script>

<style scoped>
.checkin-btn {
  display: flex;
  align-items: center;
  color: white;
  padding: 0 15px;
  height: 40px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.15);
  cursor: pointer;
  margin-right: auto; /* 将打卡按钮推到左侧 */
  transition: background-color 0.3s;
}

.checkin-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.checkin-btn i {
  font-size: 20px;
  margin-right: 8px;
}

.checkin-text {
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .checkin-text {
    display: none;
  }

  .checkin-btn {
    padding: 0 10px;
  }
}
</style>
