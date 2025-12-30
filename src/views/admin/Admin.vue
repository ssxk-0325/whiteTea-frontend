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
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/admin/categories">
            <el-icon><Menu /></el-icon>
            <span>分类管理</span>
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
            <span>文化内容</span>
          </el-menu-item>
          <el-menu-item index="/admin/activities">
            <el-icon><Calendar /></el-icon>
            <span>活动管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main style="padding: 0; background-color: #f0f2f5; overflow: auto; position: relative;">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataBoard, Menu, Goods, Document, User, House, VideoPlay, Calendar } from '@element-plus/icons-vue'

export default {
  name: 'Admin',
  components: {
    DataBoard,
    Menu,
    Goods,
    Document,
    User,
    House,
    VideoPlay,
    Calendar
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
  background-color: #f5f5f5;
}

.admin-sidebar {
  background-color: #304156;
  min-height: 100vh;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-sidebar h2 {
  color: #fff;
  text-align: center;
  margin: 0 0 15px 0;
  font-size: 18px;
}

.back-home-btn {
  width: 100%;
  color: #bfcbd9;
  padding: 8px 0;
  text-align: center;
  border: none;
  background: transparent;
}

.back-home-btn:hover {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.admin-menu {
  border-right: none;
  background-color: #304156;
}

.admin-menu .el-menu-item {
  color: #bfcbd9;
}

.admin-menu .el-menu-item:hover {
  background-color: #263445;
}

.admin-menu .el-menu-item.is-active {
  background-color: #409eff;
  color: #fff;
}
</style>

