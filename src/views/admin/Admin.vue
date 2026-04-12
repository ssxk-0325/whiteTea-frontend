<template>
  <div class="admin-page">
    <el-container>
      <el-aside width="200px" class="admin-sidebar">
        <div class="sidebar-header">
          <h2>管理后台</h2>
          <el-button 
            type="text" 
            class="back-home-btn"
            @click="goHome"
            :icon="House"
          >
            返回首页
          </el-button>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><DataBoard /></el-icon>
            <span>数据统计</span>
          </el-menu-item>
          <el-menu-item index="/admin/products">
            <el-icon><Goods /></el-icon>
            <span>产品管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/orders">
            <el-icon><Document /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/culture">
            <el-icon><VideoPlay /></el-icon>
            <span>福鼎白茶文化</span>
          </el-menu-item>
        <el-menu-item index="/admin/activities">
          <el-icon><Calendar /></el-icon>
          <span>活动管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/industry-applications">
          <el-icon><Bell /></el-icon>
          <span>产业报名审核</span>
        </el-menu-item>
          <el-menu-item index="/admin/quiz">
            <el-icon><QuestionFilled /></el-icon>
            <span>问答管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/rewards">
            <el-icon><Present /></el-icon>
            <span>积分商城</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/customer-service">
            <el-icon><Service /></el-icon>
            <span>客服会话</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main style="padding: 0; background: transparent; overflow: auto; position: relative;">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
  import { DataBoard, Goods, Document, User, House, VideoPlay, Calendar, QuestionFilled, Bell, Present, Service } from '@element-plus/icons-vue'

export default {
  name: 'Admin',
  components: {
    DataBoard,
    Goods,
    Document,
    User,
    House,
    VideoPlay,
    Calendar,
    Bell,
    QuestionFilled,
    Present,
    Service
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const activeMenu = computed(() => route.path)

    const handleMenuSelect = (index) => {
      console.log('菜单点击:', index)
      router.push(index).then(() => {
        console.log('路由跳转成功:', route.path)
      }).catch(err => {
        console.error('路由跳转失败:', err)
      })
    }

    const goHome = () => {
      router.push('/')
    }

    // 监听路由变化
    watch(() => route.path, (newPath) => {
      console.log('路由变化:', newPath)
    })

    return {
      activeMenu,
      handleMenuSelect,
      goHome
    }
  }
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: transparent;
}

.admin-sidebar {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
  box-shadow: var(--shadow-xl);
  position: relative;
  overflow: hidden;
}

.admin-sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-gradient);
  opacity: 0.1;
  z-index: 0;
}

.sidebar-header {
  padding: 32px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}

.admin-sidebar h2 {
  color: white;
  text-align: center;
  margin: 0 0 20px 0;
  font-size: var(--font-size-xl);
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.back-home-btn {
  width: 100%;
  color: rgba(255, 255, 255, 0.8);
  padding: 12px 0;
  text-align: center;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-base);
  transition: var(--transition-base);
  font-weight: 500;
}

.back-home-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.admin-menu {
  border-right: none;
  background: transparent;
  position: relative;
  z-index: 1;
}

.admin-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.8);
  margin: 4px 12px;
  border-radius: var(--radius-base);
  transition: var(--transition-base);
  font-weight: 500;
}

.admin-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

.admin-menu :deep(.el-menu-item.is-active) {
  background: var(--primary-gradient);
  color: white;
  box-shadow: var(--shadow-md);
}

.admin-menu :deep(.el-icon) {
  margin-right: 8px;
  font-size: 18px;
}
</style>

