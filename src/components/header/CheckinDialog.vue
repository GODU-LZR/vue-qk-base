<template>
  <el-dialog
      title="运动打卡"
      :visible.sync="dialogVisible"
      width="400px"
      custom-class="checkin-dialog"
      :append-to-body="true"
      :close-on-click-modal="true"
      @update:visible="$emit('update:visible', $event)"
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
        <!-- 自定义的迷你日历布局 -->
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
</template>

<script>
export default {
  name: 'CheckinDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    checkinStreak: {
      type: Number,
      default: 0
    },
    checkinTotal: {
      type: Number,
      default: 0
    },
    checkedDates: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      calendarDate: new Date()
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    },
    isTodayChecked() {
      const today = new Date().toISOString().split('T')[0];
      return this.isDateChecked(today);
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

      // 添加下个月的日期，补满6行
      const remainingDays = 42 - days.length;
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
    // 检查日期是否已打卡
    isDateChecked(dateString) {
      return this.checkedDates.includes(dateString);
    },

    // 执行打卡操作
    checkIn() {
      this.$emit('check-in');
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
  }
};
</script>

<style scoped>
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

.checkin-actions {
  display: flex;
  justify-content: center;
}

.checkin-button {
  width: 180px;
  height: 40px;
}
</style>
