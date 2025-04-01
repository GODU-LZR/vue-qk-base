<template>
  <el-header height="60px" class="header-container">
    <!-- Logo部分 -->
    <AppLogo />

    <!-- 搜索框 -->
    <SearchBox @search="handleSearch" />

    <!-- 天气信息展示 -->
    <WeatherInfo :weatherData="weatherData" :locationFailed="locationFailed" />

    <!-- 运动打卡按钮 -->
    <CheckinButton @show-checkin="showCheckinDialog" />

    <div class="header-right">
      <!-- 通知中心 -->
      <NotificationCenter :messages="messages" :todos="todos" />

      <!-- 用户头像和菜单 -->
      <UserMenu @command="handleCommand" />
    </div>

    <!-- 运动打卡弹窗 -->
    <CheckinDialog
        :visible="checkinDialogVisible"
        :checkinStreak="checkinStreak"
        :checkinTotal="checkinTotal"
        :checkedDates="checkedDates"
        :isTodayChecked="isTodayChecked"
        @update:visible="checkinDialogVisible = $event"
        @checkin="checkIn"
    />
  </el-header>
</template>

<script>
import AppLogo from '../components/header/AppLogo.vue';
import SearchBox from '../components/header/SearchBox.vue';
import WeatherInfo from '../components/header/WeatherInfo.vue';
import CheckinButton from '../components/header/CheckinButton.vue';
import NotificationCenter from '../components/header/NotificationCenter.vue';
import UserMenu from '../components/header/UserMenu.vue';
import CheckinDialog from '../components/header/CheckinDialog.vue';
import axios from 'axios';

export default {
  name: 'TopHeader',
  components: {
    AppLogo,
    SearchBox,
    WeatherInfo,
    CheckinButton,
    NotificationCenter,
    UserMenu,
    CheckinDialog
  },
  data() {
    return {
      weatherData: null,
      locationFailed: false,
      checkinDialogVisible: false,
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
    }
  },
  methods: {
    handleSearch(searchText) {
      if (!searchText.trim()) {
        return;
      }
      this.$message.success(`搜索内容: ${searchText}`);
      // TODO: 实际搜索逻辑
    },

    handleCommand(command) {
      if (command === 'logout') {
        this.$store.dispatch('logout')
            .then(() => {
              this.$message.success('已退出登录');
              this.$router.push('/login');
            })
            .catch(error => {
              this.$message.error('登出失败：' + error.message);
            });
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
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
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
              this.useDefaultLocation();
            },
            options
        );
      } else {
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

    // 显示打卡弹窗
    showCheckinDialog() {
      this.checkinDialogVisible = true;
    },

    // 执行打卡操作
    checkIn() {
      const today = new Date().toISOString().split('T')[0];

      if (!this.isTodayChecked) {
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
    }
  },
  mounted() {
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

.header-right {
  display: flex;
  align-items: center;
  margin-left: auto; /* 将右侧内容推到最右边 */
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 10px;
  }
}
</style>
