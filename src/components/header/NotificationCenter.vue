<template>
  <el-popover
      placement="bottom"
      width="350"
      trigger="click"
      popper-class="notification-popover"
  >
    <div class="notification-container">
      <div class="notification-header">
        <span>通知中心</span>
        <el-link type="primary" :underline="false" class="read-all">全部已读</el-link>
      </div>
      <el-tabs v-model="activeTab" class="notification-tabs">
        <el-tab-pane label="消息(3)" name="message">
          <div class="notification-list">
            <div class="notification-item" v-for="(item, index) in messages" :key="'msg-'+index">
              <div class="notification-icon" :class="{'unread': item.unread}">
                <i :class="item.icon"></i>
              </div>
              <div class="notification-content">
                <div class="notification-title">{{item.title}}</div>
                <div class="notification-time">{{item.time}}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="待办(5)" name="todo">
          <div class="notification-list">
            <div class="notification-item" v-for="(item, index) in todos" :key="'todo-'+index">
              <div class="notification-icon" :class="{'unread': item.unread}">
                <i :class="item.icon"></i>
              </div>
              <div class="notification-content">
                <div class="notification-title">{{item.title}}</div>
                <div class="notification-time">{{item.time}}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div class="view-more">
        <el-button type="text">查看更多</el-button>
      </div>
    </div>
    <el-badge :value="8" :max="99" slot="reference" class="header-icon-btn">
      <i class="el-icon-bell"></i>
    </el-badge>
  </el-popover>
</template>

<script>
export default {
  name: 'NotificationCenter',
  props: {
    messages: Array,
    todos: Array
  },
  data() {
    return {
      activeTab: 'message'
    }
  }
}
</script>

<style scoped>
.header-icon-btn {
  font-size: 18px;
  padding: 0 12px;
  cursor: pointer;
  height: 40px;
  display: flex;
  align-items: center;
  color: white;
}

.header-icon-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* 通知中心样式 */
.notification-container {
  max-height: 400px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  font-weight: 500;
}

.notification-list {
  max-height: 280px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
}

.notification-item:hover {
  background-color: #f9f9f9;
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.notification-icon.unread {
  background-color: #e6f7ff;
  color: #1890ff;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.view-more {
  text-align: center;
  padding: 10px 0;
  border-top: 1px solid #eee;
}

:deep(.notification-popover) {
  padding: 0;
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__nav) {
  width: 100%;
}

:deep(.el-tabs__item) {
  width: 50%;
  text-align: center;
}
</style>
