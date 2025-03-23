<template>
  <div class="tech-intro-container">
    <div class="logo-container">
      <i class="el-icon-basketball" style="font-size: 64px;"></i>
    </div>
    <h2 class="system-title">体育管理系统</h2>
    <div class="divider"></div>

    <el-scrollbar class="scrollable-content" ref="scrollbar">
      <div class="system-desc animate-item">
        <p>本系统是一套现代化的体育场馆资源管理与服务平台，采用微服务架构设计，支持场地预约、器材租借、赛事管理、财务管理、论坛交流等综合功能，为用户提供一站式体育资源管理解决方案。</p>
      </div>

      <div class="feature-section">
        <h3 class="animate-item"><i class="el-icon-menu"></i> 系统功能</h3>
        <ul>
          <li class="animate-item"><i class="el-icon-user"></i> 多角色用户管理</li>
          <li class="animate-item"><i class="el-icon-location"></i> 场地预约与管理</li>
          <li class="animate-item"><i class="el-icon-s-tools"></i> 器材租借与维护</li>
          <li class="animate-item"><i class="el-icon-trophy"></i> 赛事组织与管理</li>
          <li class="animate-item"><i class="el-icon-money"></i> 智能财务与账单</li>
          <li class="animate-item"><i class="el-icon-chat-dot-round"></i> 社区论坛与公告</li>
          <li class="animate-item"><i class="el-icon-bell"></i> 多渠道消息通知</li>
        </ul>
      </div>

      <div class="tech-stack">
        <h3 class="animate-item"><i class="el-icon-s-operation"></i> 技术架构</h3>
        <div class="tech-category">
          <h4 class="animate-item">前端技术</h4>
          <ul>
            <li class="animate-item"><i class="el-icon-check"></i> Vue.js + Vuex + Vue Router</li>
            <li class="animate-item"><i class="el-icon-check"></i> Element UI 组件库</li>
            <li class="animate-item"><i class="el-icon-check"></i> Qiankun 微前端框架</li>
            <li class="animate-item"><i class="el-icon-check"></i> Axios 请求库</li>
            <li class="animate-item"><i class="el-icon-check"></i> ECharts 数据可视化</li>
          </ul>
        </div>

        <div class="tech-category">
          <h4 class="animate-item">后端技术</h4>
          <ul>
            <li class="animate-item"><i class="el-icon-check"></i> Spring Cloud 微服务生态</li>
            <li class="animate-item"><i class="el-icon-check"></i> Nacos 服务注册与配置中心</li>
            <li class="animate-item"><i class="el-icon-check"></i> Sentinel 流量控制与熔断</li>
            <li class="animate-item"><i class="el-icon-check"></i> Gateway API 网关</li>
            <li class="animate-item"><i class="el-icon-check"></i> Dubbo + Feign 服务通信</li>
          </ul>
        </div>

        <div class="tech-category">
          <h4 class="animate-item">数据存储</h4>
          <ul>
            <li class="animate-item"><i class="el-icon-check"></i> MySQL 关系型数据库</li>
            <li class="animate-item"><i class="el-icon-check"></i> Redis 缓存服务</li>
            <li class="animate-item"><i class="el-icon-check"></i> Elasticsearch 搜索引擎</li>
            <li class="animate-item"><i class="el-icon-check"></i> MongoDB 文档数据库</li>
            <li class="animate-item"><i class="el-icon-check"></i> MinIO 对象存储</li>
          </ul>
        </div>

        <div class="tech-category">
          <h4 class="animate-item">AI与智能服务</h4>
          <ul>
            <li class="animate-item"><i class="el-icon-check"></i> SpringAI 智能服务集成</li>
            <li class="animate-item"><i class="el-icon-check"></i> 向量数据库支持语义搜索</li>
            <li class="animate-item"><i class="el-icon-check"></i> 对话式操作交互体验</li>
          </ul>
        </div>
      </div>

      <div class="tech-stack">
        <h3 class="animate-item"><i class="el-icon-star-on"></i> 系统特色</h3>
        <ul>
          <li class="animate-item"><i class="el-icon-s-flag"></i> 微服务架构，高可扩展性</li>
          <li class="animate-item"><i class="el-icon-s-flag"></i> AI驱动的自然语言交互</li>
          <li class="animate-item"><i class="el-icon-s-flag"></i> 完善的权限与角色管理</li>
          <li class="animate-item"><i class="el-icon-s-flag"></i> 多渠道消息通知系统</li>
          <li class="animate-item"><i class="el-icon-s-flag"></i> 全方位的财务管理流程</li>
        </ul>
      </div>
    </el-scrollbar>

    <div class="footer-info">
      <p>体育管理系统 V1.0 © 2025</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TechIntro',
  data() {
    return {
      observer: null,
      visibleItems: new Set(), // 追踪当前可见的元素
      lastScrollTop: 0, // 跟踪上次滚动位置
      scrollDirection: 'down' // 默认滚动方向
    }
  },
  mounted() {
    // 初始化滚动观察器
    this.initObserver();

    // 添加滚动方向检测
    this.setupScrollDirectionDetection();

    // 为可见的元素添加初始动画
    this.animateInitialItems();

    // 延迟后开始观察所有元素
    setTimeout(() => {
      this.observeAllItems();
    }, 100);
  },
  methods: {
    setupScrollDirectionDetection() {
      const scrollElement = this.$refs.scrollbar.$el.querySelector('.el-scrollbar__wrap');
      this.lastScrollTop = scrollElement.scrollTop;

      scrollElement.addEventListener('scroll', () => {
        const st = scrollElement.scrollTop;

        // 判断滚动方向
        if (st > this.lastScrollTop) {
          // 向下滚动
          this.scrollDirection = 'down';
          this.$el.classList.remove('scrolling-up');
          this.$el.classList.add('scrolling-down');
        } else if (st < this.lastScrollTop) {
          // 向上滚动
          this.scrollDirection = 'up';
          this.$el.classList.remove('scrolling-down');
          this.$el.classList.add('scrolling-up');
        }

        this.lastScrollTop = st;
      });
    },

    initObserver() {
      // 创建 Intersection Observer
      this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              // 当元素进入视口
              if (entry.isIntersecting) {
                if (!this.visibleItems.has(entry.target)) {
                  // 根据滚动方向设置不同的起始位置
                  if (this.scrollDirection === 'up') {
                    entry.target.style.transform = 'translateY(-20px)';
                  } else {
                    entry.target.style.transform = 'translateY(20px)';
                  }

                  // 强制重排以确保transform变化生效
                  void entry.target.offsetWidth;

                  // 添加动画类
                  entry.target.classList.add('fade-in');
                  this.visibleItems.add(entry.target);
                }
              } else {
                // 当元素离开视口，重置其状态
                entry.target.classList.remove('fade-in');
                this.visibleItems.delete(entry.target);
              }
            });
          },
          {
            root: this.$refs.scrollbar.$el,
            threshold: 0.1,
            rootMargin: '10px' // 稍微提前触发
          }
      );
    },

    animateInitialItems() {
      // 找出初始可见的元素
      const scrollElement = this.$refs.scrollbar.$el;
      const viewportHeight = scrollElement.clientHeight;

      document.querySelectorAll('.animate-item').forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        // 检查元素是否在初始视口中
        if (rect.top < viewportHeight && rect.bottom > 0) {
          // 设置递增的延迟，实现序列动画效果
          item.style.transitionDelay = `${index * 0.05}s`; // 使用更快的延迟
          item.classList.add('fade-in');
          this.visibleItems.add(item);
        }
      });
    },

    observeAllItems() {
      // 观察所有元素，包括已经显示的元素
      document.querySelectorAll('.animate-item').forEach(item => {
        this.observer.observe(item);
      });
    }
  },
  beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    // 移除滚动事件监听器
    const scrollElement = this.$refs.scrollbar.$el.querySelector('.el-scrollbar__wrap');
    if (scrollElement) {
      scrollElement.removeEventListener('scroll');
    }
  }
}
</script>

<style scoped>
/* 保留原有的基础样式... */
.tech-intro-container {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 40px;
  height: 100%;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  border-radius: 8px 0 0 8px;
  overflow: hidden;
}

.logo-container {
  text-align: center;
  margin-bottom: 20px;
}

.system-title {
  font-size: 32px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.divider {
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  margin: 15px 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 20px;
  /* 隐藏滚动条 /
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollable-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.system-desc {
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.system-desc p {
  font-size: 16px;
  line-height: 1.8;
  opacity: 0.9;
  text-align: justify;
  margin: 0;
}

.tech-stack h3, .feature-section h3 {
  font-size: 22px;
  margin-bottom: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.tech-stack h3 i, .feature-section h3 i {
  margin-right: 12px;
  font-size: 24px;
}

.tech-category {
  margin-bottom: 25px;
  padding: 0 10px;
}

.tech-category h4 {
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  padding-left: 12px;
  border-left: 3px solid #fff;
  display: flex;
  align-items: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.tech-stack ul, .feature-section ul {
  list-style-type: none;
  padding: 0 15px;
  margin-bottom: 20px;
}

.tech-stack ul li, .feature-section ul li {
  font-size: 15px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.tech-stack ul li:hover, .feature-section ul li:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.tech-stack ul li i, .feature-section ul li i {
  margin-right: 12px;
  color: #fff;
  font-size: 16px;
}

.feature-section {
  margin-bottom: 30px;
  padding: 0 10px;
}

.footer-info {
  text-align: center;
  font-size: 14px;
  opacity: 0.7;
  padding-bottom: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

/* 优化动画相关样式 */
.animate-item {
  opacity: 0;
  /* 初始transform值将由js动态设置 */
  transition: opacity 0.5s ease-out,
  transform 0.5s ease-out;
  will-change: opacity, transform; /* 性能优化 */
}

.animate-item.fade-in {
  opacity: 1;
  transform: translateY(0) !important; /* 使用!important确保覆盖内联样式 */
}

/* 滚动条相关样式 */
:deep(.el-scrollbar__wrap) {
  overflow-x: hidden !important;
  margin-right: 0 !important;
}

:deep(.el-scrollbar__bar.is-vertical) {
  display: none;
}

:deep(.el-scrollbar__bar.is-horizontal) {
  display: none;
}

.scrollable-content {
  flex: 1;
  height: calc(100% - 200px);
}

:deep(.el-scrollbar__wrap::-webkit-scrollbar) {
  display: none;
}

:deep(.el-scrollbar__wrap) {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
