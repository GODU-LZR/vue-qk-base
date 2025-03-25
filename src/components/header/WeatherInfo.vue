<template>
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
</template>

<script>
export default {
  name: 'WeatherInfo',
  props: {
    weatherData: Object,
    locationFailed: Boolean
  },
  methods: {
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
    }
  }
}
</script>

<style scoped>
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

@media (max-width: 768px) {
  .weather-container {
    padding: 0 10px;
  }

  .weather-desc {
    display: none;
  }
}
</style>
