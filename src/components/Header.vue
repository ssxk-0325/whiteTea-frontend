<template>
  <div class="header">
    <div class="header-content">
      <div class="logo" @click="$router.push('/')">
        <h1>福鼎白茶服务平台</h1>
      </div>
      <el-menu
        mode="horizontal"
        :default-active="activeIndex"
        @select="handleSelect"
        class="header-menu"
        :router="false"
      >
        <el-menu-item index="home" @click="handleMenuClick('/')">首页</el-menu-item>
        <el-menu-item index="products" @click="handleMenuClick('/products')">产品</el-menu-item>
        <el-menu-item index="culture" @click="handleMenuClick('/culture')">白茶文化</el-menu-item>
        <el-menu-item index="activity" @click="handleMenuClick('/activity')">活动</el-menu-item>
        <el-menu-item index="community" @click="handleMenuClick('/community')">社区</el-menu-item>
      </el-menu>
      <div class="header-right">
        <el-button 
          @click="goToCustomerService" 
          :icon="Service" 
          type="primary"
          :disabled="!isLoggedIn"
        >
          智能客服
        </el-button>
        <el-badge :value="cartCount" class="cart-badge" v-if="isLoggedIn">
          <el-button @click="$router.push('/cart')" :icon="ShoppingCart">购物车</el-button>
        </el-badge>
        <el-dropdown v-if="isLoggedIn" @command="handleCommand">
          <span class="user-info">
            <el-avatar :src="userInfo?.avatar" :size="30">{{ userInfo?.nickname?.charAt(0) }}</el-avatar>
            <span>{{ userInfo?.nickname || userInfo?.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="orders">我的订单</el-dropdown-item>
              <el-dropdown-item command="coupons">我的券包</el-dropdown-item>
              <el-dropdown-item command="customerService">智能客服</el-dropdown-item>
              <el-dropdown-item command="admin" v-if="userType === 1">管理后台</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button v-else @click="$router.push('/login')">登录</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ShoppingCart, ArrowDown, Service } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

export default {
  name: 'Header',
  components: {
    ShoppingCart,
    ArrowDown,
    Service
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()

    const isLoggedIn = computed(() => store.getters['user/isLoggedIn'])
    const userInfo = computed(() => store.state.user.userInfo)
    const userType = computed(() => store.getters['user/userType'])
    const cartCount = computed(() => store.state.cart.cartCount)

    const activeIndex = computed(() => {
      const path = route.path
      if (path === '/') return 'home'
      if (path.startsWith('/products')) return 'products'
      if (path.startsWith('/culture')) return 'culture'
      if (path.startsWith('/activity')) return 'activity'
      if (path.startsWith('/community')) return 'community'
      return ''
    })

    const handleSelect = (key) => {
      console.log('handleSelect 被调用，key:', key)
      let targetRoute = null
      switch (key) {
        case 'home':
          targetRoute = '/'
          break
        case 'products':
          targetRoute = '/products'
          break
        case 'culture':
          targetRoute = '/culture'
          break
        case 'activity':
          targetRoute = '/activity'
          break
        case 'community':
          targetRoute = '/community'
          break
        default:
          console.warn('未知的菜单项:', key)
          return
      }
      console.log('目标路由:', targetRoute)
      if (targetRoute) {
        router.push(targetRoute).then(() => {
          console.log('路由跳转成功:', targetRoute)
        }).catch(err => {
          console.error('路由跳转失败:', err, targetRoute)
        })
      }
    }

    const handleMenuClick = (path) => {
      console.log('handleMenuClick 被调用，path:', path)
      if (path === '/community') {
        console.log('准备跳转到社区页面')
      }
      router.push(path).then(() => {
        console.log('路由跳转成功:', path)
      }).catch(err => {
        console.error('路由跳转失败:', err, path)
      })
    }

    const goToCustomerService = () => {
      if (!isLoggedIn.value) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }
      router.push('/customer-service')
    }

    const handleCommand = (command) => {
      switch (command) {
        case 'profile':
          router.push('/profile')
          break
        case 'orders':
          router.push('/orders')
          break
        case 'coupons':
          router.push('/activity/coupons')
          break
        case 'customerService':
          goToCustomerService()
          break
        case 'admin':
          console.log('点击管理后台，当前用户类型:', userType.value)
          console.log('用户信息:', userInfo.value)
          router.push('/admin/dashboard').then(() => {
            console.log('管理后台跳转成功')
          }).catch(err => {
            console.error('管理后台跳转失败:', err)
          })
          break
        case 'logout':
          ElMessageBox.confirm('确定要退出登录吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            store.dispatch('user/logout')
            router.push('/')
          })
          break
      }
    }

    return {
      isLoggedIn,
      userInfo,
      userType,
      cartCount,
      activeIndex,
      handleSelect,
      handleMenuClick,
      handleCommand,
      goToCustomerService,
      ShoppingCart,
      ArrowDown,
      Service
    }
  }
}
</script>

<style scoped>
.header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  cursor: pointer;
}

.logo h1 {
  font-size: 24px;
  color: #409eff;
  margin: 0;
}

.header-menu {
  flex: 1;
  border-bottom: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.cart-badge {
  margin-right: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 10px;
}

.user-info:hover {
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>

