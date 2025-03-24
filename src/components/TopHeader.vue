<template>
  <el-header height="60px" class="header-container">
    <div class="logo">
      <i class="el-icon-basketball logo-icon"></i>
      <h1 class="logo-text">体育管理系统</h1>
    </div>

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

    <!-- 天气信息展示 -->
    <div class="weather-container" v-if="weatherData">
      <i :class="getWeatherIcon(weatherData.icon)"></i>
      <div class="weather-info">
        <div class="weather-temp">{{ weatherData.temp }}°C</div>
        <div class="weather-desc">
          {{ weatherData.text }} · {{ getSportAdvice() }}
          <span v-if="locationFailed" class="location-note">(湛江)</span>
        </div>
      </div>
    </div>
    <div class="weather-container" v-else>
      <i class="el-icon-loading"></i>
      <div class="weather-info">
        <div class="weather-temp">加载中...</div>
      </div>
    </div>

    <!-- 运动打卡按钮 -->
    <div class="checkin-btn" @click="showCheckinDialog">
      <i class="el-icon-medal"></i>
      <span class="checkin-text">运动打卡</span>
    </div>

    <div class="header-right">
      <!-- 通知中心 -->
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

      <!-- 用户头像和菜单 -->
      <el-dropdown trigger="click" @command="handleCommand" class="avatar-dropdown">
        <div class="avatar-container">
          <el-avatar :size="36" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
          <span class="username">管理员</span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown-menu">
          <el-dropdown-item command="profile">
            <i class="el-icon-user"></i> 个人中心
          </el-dropdown-item>
          <el-dropdown-item command="settings">
            <i class="el-icon-setting"></i> 系统设置
          </el-dropdown-item>
          <el-dropdown-item divided command="logout">
            <i class="el-icon-switch-button"></i> 退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 运动打卡弹窗 -->
    <el-dialog
        title="运动打卡"
        :visible.sync="checkinDialogVisible"
        width="400px"
        custom-class="checkin-dialog"
        :append-to-body="true"
        :close-on-click-modal="true"
    >
      <div class="checkin-dialog-content">
        <div class="checkin-stats">
          <div class="checkin-streak">
            <div class="streak-count">{{ checkinStreak }}</div>
            <div class="streak-label">连续打卡</div>
          </div>
          <div class="checkin-total">
            <div class="total-count">{{ checkinTotal }}</div>
            <div class="total-label">累计打卡</div>
          </div>
        </div>

        <div class="calendar-container">
          <!-- 将 el-calendar 替换为自定义的迷你日历布局 -->
          <div class="calendar-header">
            <span>{{ calendarDate.getFullYear() }} 年 {{ calendarDate.getMonth() + 1 }} 月</span>
            <div class="calendar-navigation">
              <el-button type="text" icon="el-icon-arrow-left" @click="prevMonth"></el-button>
              <el-button type="text" icon="el-icon-arrow-right" @click="nextMonth"></el-button>
            </div>
          </div>
          <div class="calendar-weekdays">
            <div class="weekday" v-for="day in ['一', '二', '三', '四', '五', '六', '日']" :key="day">{{ day }}</div>
          </div>
          <div class="calendar-days">
            <div v-for="day in calendarDays" :key="day.dateString"
                 :class="['calendar-day', {'other-month': !day.currentMonth, 'today': day.isToday, 'checked': isDateChecked(day.dateString)}]">
              {{ day.day }}
              <div class="check-mark" v-if="isDateChecked(day.dateString)">
                <i class="el-icon-check"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="checkin-actions">
          <el-button
              type="primary"
              :disabled="isTodayChecked"
              @click="checkIn"
              class="checkin-button"
          >
            {{ isTodayChecked ? '今日已打卡' : '立即打卡' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </el-header>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TopHeader',
  data() {
    return {
      searchInput: '',
      activeTab: 'message',
      weatherData: null,
      locationFailed: false,
      // 打卡相关数据
      checkinDialogVisible: false,
      calendarDate: new Date(),
      checkedDates: [], // 已打卡的日期
      checkinStreak: 0, // 连续打卡天数
      checkinTotal: 0, // 累计打卡天数
      messages: [
        {
          title: '您有一个场地预约申请待审批',
          time: '10分钟前',
          icon: 'el-icon-bell',
          unread: true
        },
        {
          title: '系统维护通知：本周日凌晨2点-4点',
          time: '1小时前',
          icon: 'el-icon-warning',
          unread: true
        },
        {
          title: '您的场地申请已审批通过',
          time: '昨天',
          icon: 'el-icon-success',
          unread: true
        }
      ],
      todos: [
        {
          title: '篮球馆卫生检查',
          time: '今天 14:00',
          icon: 'el-icon-time',
          unread: true
        },
        {
          title: '器材采购审批',
          time: '明天 09:30',
          icon: 'el-icon-document',
          unread: true
        },
        {
          title: '体育赛事策划会议',
          time: '周三 10:00',
          icon: 'el-icon-date',
          unread: true
        },
        {
          title: '场馆收入统计报表提交',
          time: '周五 17:00',
          icon: 'el-icon-document',
          unread: true
        },
        {
          title: '年度体育器材盘点',
          time: '下周一',
          icon: 'el-icon-goods',
          unread: true
        }
      ]
    };
  },
  computed: {
    isTodayChecked() {
      const today = new Date().toISOString().split('T')[0];
      return this.checkedDates.includes(today);
    },
    // 添加日历数据计算属性
    calendarDays() {
      const year = this.calendarDate.getFullYear();
      const month = this.calendarDate.getMonth();

      // 获取当月第一天是星期几（0-6，0是星期日）
      const firstDayOfMonth = new Date(year, month, 1);
      let firstDayWeekday = firstDayOfMonth.getDay();
      // 将星期日的0转为7，符合中国习惯（星期一为1，星期日为7）
      firstDayWeekday = firstDayWeekday === 0 ? 7 : firstDayWeekday;

      // 获取当月天数
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // 获取上个月的天数
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      const days = [];

      // 添加上个月的日期
      for (let i = 1; i < firstDayWeekday; i++) {
        const prevMonthDay = daysInPrevMonth - firstDayWeekday + i + 1;
        const date = new Date(year, month - 1, prevMonthDay);
        days.push({
          day: prevMonthDay,
          date: date,
          currentMonth: false,
          isToday: this.isToday(date),
          dateString: this.formatDate(date)
        });
      }

      // 添加当月的日期
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        days.push({
          day: i,
          date: date,
          currentMonth: true,
          isToday: this.isToday(date),
          dateString: this.formatDate(date)
        });
      }

      // 添加下个月的日期，补满7的倍数
      const remainingDays = (42 - days.length);
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          day: i,
          date: date,
          currentMonth: false,
          isToday: this.isToday(date),
          dateString: this.formatDate(date)
        });
      }

      return days;
    }
  },
  methods: {
    handleSearch() {
      if (!this.searchInput.trim()) {
        return;
      }
      this.$message.success(`搜索内容: ${this.searchInput}`);
      // TODO: 实际搜索逻辑
    },
    handleCommand(command) {
      if (command === 'logout') {
        localStorage.removeItem('isLoggedIn');
        this.$message.success('已退出登录');
        this.$router.push('/login');
      } else if (command === 'profile') {
        this.$message.info('跳转到个人中心');
        // this.$router.push('/profile');
      } else if (command === 'settings') {
        this.$message.info('跳转到系统设置');
        // this.$router.push('/settings');
      }
    },
    // 获取天气数据
    fetchWeatherData() {
      // 尝试浏览器地理位置API
      if (navigator.geolocation) {
        const options = {
          enableHighAccuracy: false, // 降低精度要求可提高兼容性
          timeout: 5000,             // 超时时间设置为5秒
          maximumAge: 0              // 不使用缓存的位置
        };

        navigator.geolocation.getCurrentPosition(
            position => {
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;
              this.locationFailed = false;
              this.getWeatherByLocation(latitude, longitude);
            },
            error => {
              console.error('获取位置失败:', error);
              // 默认使用湛江的位置
              this.useDefaultLocation();
            },
            options
        );
      } else {
        // 不支持地理位置API时，默认使用湛江的位置
        this.useDefaultLocation();
      }
    },

    // 使用默认位置（湛江）
    useDefaultLocation() {
      this.locationFailed = true;
      // 湛江经纬度：21.271, 110.359
      this.getWeatherByLocation(21.271, 110.359);
    },

    // 通过经纬度获取天气信息
    getWeatherByLocation(lat, lon) {
      const apiKey = 'bc0b61d0fd4c49e8ae66be9ad7b2350f';
      const url = `https://devapi.qweather.com/v7/weather/now?location=${lon},${lat}&key=${apiKey}`;

      axios.get(url)
          .then(response => {
            if (response.data.code === '200') {
              const weatherNow = response.data.now;
              this.weatherData = {
                temp: weatherNow.temp,
                text: weatherNow.text,
                icon: weatherNow.icon,
                humidity: weatherNow.humidity,
                windSpeed: weatherNow.windSpeed
              };
            } else {
              console.error('获取天气失败:', response.data);
              this.$message.error('获取天气信息失败');
            }
          })
          .catch(error => {
            console.error('天气API请求错误:', error);
            this.$message.error('获取天气信息失败');
          });
    },

    // 根据天气代码返回对应的Element UI图标
    getWeatherIcon(iconCode) {
      // 根据和风天气图标代码映射到Element UI图标
      const iconMap = {
        // 晴
        '100': 'el-icon-sunny',
        '150': 'el-icon-sunny',
        // 多云
        '101': 'el-icon-partly-cloudy',
        '102': 'el-icon-partly-cloudy',
        '103': 'el-icon-partly-cloudy',
        '153': 'el-icon-partly-cloudy',
        // 阴天
        '104': 'el-icon-cloudy',
        '154': 'el-icon-cloudy',
        // 雨
        '300': 'el-icon-light-rain',
        '301': 'el-icon-light-rain',
        '302': 'el-icon-heavy-rain',
        '303': 'el-icon-heavy-rain',
        '304': 'el-icon-heavy-rain',
        '305': 'el-icon-light-rain',
        '306': 'el-icon-light-rain',
        '307': 'el-icon-heavy-rain',
        '308': 'el-icon-heavy-rain',
        '309': 'el-icon-light-rain',
        '310': 'el-icon-light-rain',
        '311': 'el-icon-heavy-rain',
        '312': 'el-icon-heavy-rain',
        '313': 'el-icon-heavy-rain',
        '314': 'el-icon-heavy-rain',
        '315': 'el-icon-heavy-rain',
        '316': 'el-icon-light-rain',
        '317': 'el-icon-light-rain',
        '318': 'el-icon-heavy-rain',
        // 雪
        '400': 'el-icon-light-snow',
        '401': 'el-icon-light-snow',
        '402': 'el-icon-heavy-snow',
        '403': 'el-icon-heavy-snow',
        '404': 'el-icon-heavy-snow',
        '405': 'el-icon-light-snow',
        '406': 'el-icon-light-snow',
        '407': 'el-icon-heavy-snow',
        '408': 'el-icon-heavy-snow',
        '409': 'el-icon-heavy-snow',
        '410': 'el-icon-heavy-snow',
        // 雾
        '500': 'el-icon-cloudy',
        '501': 'el-icon-cloudy',
        '502': 'el-icon-cloudy',
        '503': 'el-icon-cloudy',
        '504': 'el-icon-cloudy',
        '507': 'el-icon-cloudy',
        '508': 'el-icon-cloudy',
        '509': 'el-icon-cloudy',
        '510': 'el-icon-cloudy',
        '511': 'el-icon-cloudy',
        '512': 'el-icon-cloudy',
        '513': 'el-icon-cloudy',
        '514': 'el-icon-cloudy',
        '515': 'el-icon-cloudy',
      };

      return iconMap[iconCode] || 'el-icon-cloudy'; // 默认为多云图标
    },

    // 根据天气情况给出运动建议
    getSportAdvice() {
      if (!this.weatherData) return '';

      const { temp, text } = this.weatherData;

      // 不适宜运动的天气条件
      const badWeatherConditions = ['暴雨', '大雨', '雷阵雨', '雷电', '冰雹', '暴雪', '大雪', '沙尘暴', '大雾', '雾霾'];

      // 检查是否包含不适宜运动的天气条件
      for (const condition of badWeatherConditions) {
        if (text.includes(condition)) {
          return '不宜运动';
        }
      }

      // 温度判断
      if (temp < 5) {
        return '注意保暖';
      } else if (temp > 32) {
        return '避免剧烈运动';
      } else if (temp >= 15 && temp <= 28) {
        return '适宜运动';
      } else {
        return '适度运动';
      }
    },

    // 显示打卡弹窗
    showCheckinDialog() {
      this.checkinDialogVisible = true;
    },

    // 检查日期是否已打卡
    isDateChecked(dateString) {
      return this.checkedDates.includes(dateString);
    },

    // 执行打卡操作
    checkIn() {
      const today = new Date().toISOString().split('T')[0];

      if (!this.isDateChecked(today)) {
        this.checkedDates.push(today);
        this.checkinTotal++;

        // 计算连续打卡天数
        this.calculateStreak();

        // 保存打卡记录到本地存储
        this.saveCheckinData();

        this.$message.success('打卡成功！');
      }
    },

    // 计算连续打卡天数
    calculateStreak() {
      let streak = 0;
      const today = new Date();

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toISOString().split('T')[0];

        if (this.checkedDates.includes(dateString)) {
          streak++;
        } else {
          break;
        }
      }

      this.checkinStreak = streak;
    },

    // 保存打卡数据到本地存储
    saveCheckinData() {
      const checkinData = {
        checkedDates: this.checkedDates,
        checkinTotal: this.checkinTotal,
        checkinStreak: this.checkinStreak
      };

      localStorage.setItem('sportCheckinData', JSON.stringify(checkinData));
    },

    // 从本地存储加载打卡数据
    loadCheckinData() {
      const savedData = localStorage.getItem('sportCheckinData');

      if (savedData) {
        const data = JSON.parse(savedData);
        this.checkedDates = data.checkedDates || [];
        this.checkinTotal = data.checkinTotal || 0;
        this.checkinStreak = data.checkinStreak || 0;
      }

      // 重新计算连续打卡天数（以防日期变化）
      this.calculateStreak();
    },
    // 判断日期是否是今天
    isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear();
    },

    // 格式化日期为 ISO 格式的日期部分
    formatDate(date) {
      return date.toISOString().split('T')[0];
    },

    // 上个月按钮
    prevMonth() {
      const date = new Date(this.calendarDate);
      date.setMonth(date.getMonth() - 1);
      this.calendarDate = date;
    },

    // 下个月按钮
    nextMonth() {
      const date = new Date(this.calendarDate);
      date.setMonth(date.getMonth() + 1);
      this.calendarDate = date;
    }
  },
  mounted() {
    // 设置初始选中菜单
    this.activeIndex = this.$route.path;
    // 获取天气数据
    this.fetchWeatherData();
    // 加载打卡数据
    this.loadCheckinData();
  }
};
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  background: linear-gradient(to right, #1d4ed8, #3b82f6);
  color: #fff;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 999;
}

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

/* 天气容器样式 */
.weather-container {
  display: flex;
  align-items: center;
  color: white;
  padding: 0 20px;
  margin-right: 10px;
  height: 40px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
}

.weather-container i {
  font-size: 24px;
  margin-right: 10px;
}

.weather-info {
  display: flex;
  flex-direction: column;
}

.weather-temp {
  font-size: 16px;
  font-weight: 500;
}

.weather-desc {
  font-size: 12px;
  opacity: 0.9;
}

.location-note {
  font-size: 10px;
  opacity: 0.8;
  margin-left: 4px;
}

/* 运动打卡按钮样式 */
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

.header-right {
  display: flex;
  align-items: center;
  margin-left: auto; /* 将右侧内容推到最右边 */
}

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

.avatar-dropdown {
  margin-left: 15px;
  cursor: pointer;
  height: 60px;
  display: flex;
  align-items: center;
}

.avatar-container {
  display: flex;
  align-items: center;
}

.username {
  margin: 0 8px;
  white-space: nowrap;
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

/* 打卡弹窗样式 */
:deep(.checkin-dialog .el-dialog__body) {
  padding: 20px;
}

.checkin-dialog-content {
  display: flex;
  flex-direction: column;
}

.checkin-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  text-align: center;
}

.checkin-streak, .checkin-total {
  padding: 15px;
  border-radius: 8px;
  background-color: #f5f7fa;
  width: 45%;
}

.streak-count, .total-count {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.streak-label, .total-label {
  font-size: 14px;
  color: #606266;
}

.calendar-container {
  margin-bottom: 20px;
}

:deep(.calendar-day) {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

:deep(.is-checked) {
  color: #409EFF;
  font-weight: bold;
}

:deep(.check-mark) {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 12px;
  color: #67C23A;
}

.checkin-actions {
  display: flex;
  justify-content: center;
}

.checkin-button {
  width: 180px;
  height: 40px;
}

@media (max-width: 768px) {
  .logo-text {
    display: none;
  }

  .logo {
    width: auto;
  }

  .username {
    display: none;
  }

  .search-box {
    max-width: none;
  }

  .weather-container {
    padding: 0 10px;
  }

  .weather-desc {
    display: none;
  }

  .checkin-text {
    display: none;
  }

  .checkin-btn {
    padding: 0 10px;
  }
}

/* 日历组件样式 */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 5px;
  margin-bottom: 5px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 30px);
  gap: 2px;
}

.calendar-day {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
}

.calendar-day.other-month {
  color: #c0c4cc;
}

.calendar-day.today {
  color: #409EFF;
  font-weight: bold;
  background-color: rgba(64, 158, 255, 0.1);
}

.calendar-day.checked {
  color: #67C23A;
}

.check-mark {
  position: absolute;
  bottom: -2px;
  right: 0;
  font-size: 10px;
  color: #67C23A;
}
</style>
