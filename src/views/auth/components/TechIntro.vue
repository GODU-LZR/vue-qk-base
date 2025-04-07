<template>
  <div class="tech-intro-container">
    <div class="logo-container">
      <i class="el-icon-basketball" style="font-size: 64px;"></i>
    </div>
    <!-- 修改 H2 结构以包含图标和 分隔图标 -->
    <h2 class="system-title">
      <img :src="require('@/assets/deepseek.png')" alt="DeepSeek Logo" class="title-logo">
      <!-- 将 X 替换为 Element UI 图标 -->
      <i class="el-icon-link title-icon-separator"></i>
      <span>智能城市体育云平台</span>
    </h2>

    <!-- 系统介绍移到这里，并移除 animate-item 类 -->
    <div class="system-desc">
      <p>本平台基于成熟的 Spring Cloud 微服务架构构建，确保了系统的高可用性与弹性伸缩能力，能够从容应对高并发访问和业务增长需求。核心集成 SpringAI 框架，亮点在于支持接入本地化部署的 DeepSeek 大模型及向量数据库，不仅保障数据隐私与安全，更能赋能平台实现便捷、精准的自然语言交互功能，极大提升用户操作体验。同时，平台融合了关系型数据库、缓存、搜索引擎等多样化存储技术，并实施了多层级安全防护策略，旨在打造一个功能强大、安全可靠、智能高效的一站式城市体育云服务解决方案。</p>
    </div>
    <div class="divider"></div>
    <!-- 添加向下的箭头图标 -->
    <div class="scroll-hint">
      <i class="el-icon-arrow-down"></i>
    </div>

    <!-- 滚动区域开始 -->
    <el-scrollbar class="scrollable-content" ref="scrollbar">
      <!-- 系统介绍已移出 -->

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
          <h4 class="animate-item">鉴权与安全</h4>
          <ul>
            <li class="animate-item"><i class="el-icon-check"></i> Spring Security + JWT + 单点登录</li>
            <li class="animate-item"><i class="el-icon-check"></i> 多角色权限精细化控制</li>
            <li class="animate-item"><i class="el-icon-check"></i> OpenResty 安全防护</li>
            <li class="animate-item"><i class="el-icon-check"></i> 数据加密与脱敏</li>
            <li class="animate-item"><i class="el-icon-check"></i> WAF 网络应用防火墙</li>
          </ul>
        </div>

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
          <li class="animate-item"><i class="el-icon-s-flag"></i> 全面的安全防护机制</li>
        </ul>
      </div>
    </el-scrollbar>
    <!-- 滚动区域结束 -->

    <div class="footer-info">
      <p>智能城市体育云平台 V1.0 © 昆明茑能科技有限公司 2025</p>
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
      scrollDirection: 'down' ,// 默认滚动方向
      initialRender: true // 标记是否是初始渲染
    }
  },
  mounted() {
    // 初始化滚动观察器
    this.initObserver();

    // 添加滚动方向检测
    this.setupScrollDirectionDetection();

    // 显示所有元素，而不仅仅是视口内的元素
    this.showAllItemsInitially();

    // 延迟后开始观察所有元素以支持滚动动画
    setTimeout(() => {
      this.initialRender = false; // 标记初始渲染结束
      // 取消所有元素的显示状态，以便滚动时能重新触发动画
      this.resetItemsForScrollAnimation();
      this.observeAllItems();
    }, 2000); // 给足够时间让所有元素完成初始显示动画
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
            // 只有在初始渲染完成后才处理滚动动画
            if (!this.initialRender) {
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
            }
          },
          {
            root: this.$refs.scrollbar.$el,
            threshold: 0.1,
            rootMargin: '10px' // 稍微提前触发
          }
      );
    },
    // 修改这个方法，确保它显示所有元素
    showAllItemsInitially() {
      document.querySelectorAll('.animate-item').forEach((item, index) => {
        // 设置递增的延迟，实现序列动画效果
        item.style.transitionDelay = `${index * 0.05}s`;
        item.style.transform = 'translateY(20px)'; // 设置初始位置

        // 强制重排以确保transform变化生效
        void item.offsetWidth;

        item.classList.add('fade-in');
        this.visibleItems.add(item);
      });
    },

    // 修改重置方法，只重置视口外的元素
    resetItemsForScrollAnimation() {
      document.querySelectorAll('.animate-item').forEach(item => {
        const rect = item.getBoundingClientRect();
        const scrollElement = this.$refs.scrollbar.$el;
        const viewportHeight = scrollElement.clientHeight;

        // 只重置视口外的元素
        if (rect.top >= viewportHeight || rect.bottom <= 0) {
          item.classList.remove('fade-in');
          item.style.transitionDelay = '0s'; // 重置延迟
          item.style.transform = this.scrollDirection === 'up' ? 'translateY(-20px)' : 'translateY(20px)';
          this.visibleItems.delete(item);
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
  border-radius: 0px 0 0 0px;
  overflow: hidden;
}

.logo-container {
  text-align: center;
  margin-bottom: 20px;
}

/* 标题容器使用 Flex 布局 */
.system-title {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 水平居中，如果需要左对齐请移除或改为 flex-start */
  /* 保留或调整原有的 margin/padding 等样式 */
  margin: 10px 0; /* 示例：保留上下边距 */
  font-size: 30px; /* 示例：设置基础字体大小，确保 em 单位有基准 */
  font-weight: bold;
  color: #fff; /* 示例：标题颜色 */
}

/* DeepSeek Logo 图标样式 */
.title-logo {
  height: 1.5em; /* 高度与当前字体大小一致 */
  width: auto;  /* 宽度自适应 */
  border-radius: 4px; /* 圆角 */
  margin-right: 8px; /* 与右侧元素的间距 */
  vertical-align: middle; /* 确保与其他行内元素基线对齐（虽然 flex align-items 效果更好） */
  object-fit: contain; /* 保证图片内容完整显示 */
}

/* 分隔图标 (原 X 的位置) 样式 */
.title-icon-separator {
  font-size: 1em; /* 大小与当前字体大小一致 */
  margin: 0 8px; /* 左右间距 */
  color: #fff; /* 可以给图标设置一个颜色，例如灰色 */
  /* line-height: 1; */ /* 对于 i 标签通常不需要特别设置 line-height */
  /* Flex 布局下的 align-items: center 会处理垂直对齐 */
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

/* 系统介绍样式 (移出滚动区后) */
.system-desc {
  /* margin-bottom: 25px; */ /* 移到 scroll-hint 上 */
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  /* 不再需要动画，移除 */
}

.system-desc p {
  font-size: 16px;
  line-height: 1.8;
  opacity: 0.9;
  text-align: justify;
  margin: 0;
}


/* 向下箭头样式 */
.scroll-hint {
  text-align: center;
  margin-top: 5px; /* 与上方介绍的间距 */
  margin-bottom: 5px; /* 与下方滚动区的间距 */
}

.scroll-hint i {
  font-size: 20px; /* 图标大小 */
  color: rgba(255, 255, 255, 0.8); /* 图标颜色 */
  animation: bounce 2s infinite; /* 添加跳动动画 */
}

/* 定义跳动动画 */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(-4px);
  }
}


/* 滚动内容区域 */
.scrollable-content {
  flex: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 允许垂直滚动 */
  padding-right: 5px; /* 为可能的滚动条留空间，如果需要显示 */
  /* 隐藏滚动条样式保持不变 */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollable-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
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
