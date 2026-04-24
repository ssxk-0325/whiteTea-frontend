<template>
  <div class="header">
    <div class="header-content">
      <div class="header-left">
        <div class="logo" @click="$router.push('/')">
          <img class="logo-img" src="/images/logo.png" alt="福鼎白茶服务平台" />
          <h1 class="sr-only">福鼎白茶服务平台</h1>
        </div>
      </div>

      <div class="header-center">
        <el-menu
          mode="horizontal"
          :default-active="activeIndex"
          @select="handleSelect"
          class="header-menu"
          :router="false"
          :ellipsis="false"
        >
          <el-menu-item index="home" @click="handleMenuClick('/')">首页</el-menu-item>
          <el-menu-item index="products" @click="handleMenuClick('/products')">产品</el-menu-item>
          <el-menu-item index="culture" @click="handleMenuClick('/culture')">福鼎白茶文化</el-menu-item>
          <el-sub-menu index="services">
            <template #title>多样化服务</template>
            <el-menu-item index="offline-service" @click="handleMenuClick('/activity')">
              线下体验服务
            </el-menu-item>
            <el-menu-item index="pick-recruitment-service" @click="handleMenuClick('/services/pick-recruitment')">
              采摘招募服务
            </el-menu-item>
            <el-menu-item index="wholesale-training-service" @click="handleMenuClick('/services/wholesale-training')">
              批发培训服务
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item index="rewards" @click="handleMenuClick('/rewards')">积分商城</el-menu-item>
          <el-menu-item index="community" @click="handleMenuClick('/community')">福鼎白茶社区</el-menu-item>
        </el-menu>
      </div>

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
            <el-avatar :src="userInfo?.avatar || DEFAULT_USER_AVATAR" :size="30">{{ userInfo?.nickname?.charAt(0) }}</el-avatar>
            <span>{{ userInfo?.nickname || userInfo?.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <router-link to="/profile" style="text-decoration: none; color: inherit; display: block; width: 100%;">个人中心</router-link>
              </el-dropdown-item>
              <el-dropdown-item command="orders">
                <router-link to="/orders" style="text-decoration: none; color: inherit; display: block; width: 100%;">个人订单</router-link>
              </el-dropdown-item>
              <el-dropdown-item command="coupons">
                <router-link to="/activity/coupons" style="text-decoration: none; color: inherit; display: block; width: 100%;">个人门票</router-link>
              </el-dropdown-item>
              <el-dropdown-item command="rewards">
                <router-link to="/rewards" style="text-decoration: none; color: inherit; display: block; width: 100%;">积分商城</router-link>
              </el-dropdown-item>
              <el-dropdown-item command="exchanges">
                <router-link to="/rewards/exchanges" style="text-decoration: none; color: inherit; display: block; width: 100%;">兑换记录</router-link>
              </el-dropdown-item>
              <el-dropdown-item command="stores">
                <router-link to="/stores" style="text-decoration: none; color: inherit; display: block; width: 100%;">门店地图</router-link>
              </el-dropdown-item>
              <el-dropdown-item command="customerService" @click="goToCustomerService">智能客服</el-dropdown-item>
              <el-dropdown-item command="admin" v-if="userType === 1">
                <router-link to="/admin/dashboard" style="text-decoration: none; color: inherit; display: block; width: 100%;">管理后台</router-link>
              </el-dropdown-item>
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
import { DEFAULT_USER_AVATAR } from '@/constants/assets'
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
      if (path.startsWith('/activity')) return 'offline-service'
      if (path.startsWith('/services/pick-recruitment')) return 'pick-recruitment-service'
      if (path.startsWith('/services/wholesale-training')) return 'wholesale-training-service'
      if (path.startsWith('/services/industry')) return 'pick-recruitment-service'
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
        case 'offline-service':
          targetRoute = '/activity'
          break
        case 'pick-recruitment-service':
          targetRoute = '/services/pick-recruitment'
          break
        case 'wholesale-training-service':
          targetRoute = '/services/wholesale-training'
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
      console.log('Header handleCommand:', command)
      switch (command) {
        case 'profile':
          router.push({ name: 'Profile' }).catch(err => console.error('跳转个人中心失败:', err))
          break
        case 'orders':
          router.push({ name: 'Orders' }).catch(err => console.error('跳转订单失败:', err))
          break
        case 'coupons':
          router.push('/activity/coupons')
          break
        case 'stores':
          router.push('/stores')
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
      DEFAULT_USER_AVATAR,
      activeIndex,
      handleSelect,
      handleMenuClick,
      handleCommand,
      goToCustomerService,
      router,
      ShoppingCart,
      ArrowDown,
      Service
    }
  }
}
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: var(--transition-base);
}

.header:hover {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 32px;
  height: 72px;
  gap: 16px;
  min-width: 0;
}

.header-left {
  flex: 0 0 auto;
  min-width: 0;
}

.header-center {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.logo {
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: var(--transition-base);
  min-width: 0;
}

.logo-img {
  height: 38px;
  width: auto;
  display: block;
  object-fit: contain;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.logo:hover {
  transform: scale(1.05);
}

.logo h1 {
  font-size: 26px;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.header-menu {
  border-bottom: none;
  margin: 0;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.header-menu::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.header-menu :deep(.el-menu-item) {
  font-weight: 500;
  font-size: 15px;
  transition: var(--transition-base);
  border-radius: var(--radius-base);
  margin: 0 4px;
  flex: 0 0 auto;
}

.header-menu :deep(.el-sub-menu) {
  flex: 0 0 auto;
}

.header-menu :deep(.el-sub-menu__title) {
  border-radius: var(--radius-base);
  margin: 0 4px;
  font-weight: 500;
  font-size: 15px;
  transition: var(--transition-base);
}

.header-menu :deep(.el-sub-menu__title:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: var(--primary-color);
}

.header-menu :deep(.el-menu-item:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: var(--primary-color);
}

.header-menu :deep(.el-menu-item.is-active) {
  background: var(--primary-gradient);
  color: white;
  border-bottom: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: 0;
}

.header-right :deep(.el-button) {
  border-radius: var(--radius-base);
  font-weight: 500;
  transition: var(--transition-base);
  padding: 10px 20px;
}

.header-right :deep(.el-button--primary) {
  background: var(--primary-gradient);
  border: none;
  box-shadow: var(--shadow-sm);
}

.header-right :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.cart-badge {
  margin-right: 0;
}

.cart-badge :deep(.el-badge__content) {
  background: var(--danger-color);
  border: 2px solid white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  position: relative;
  max-width: 220px;
  min-width: 0;
}

.user-info::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  background: var(--primary-gradient);
  opacity: 0;
  transition: var(--transition-base);
}

.user-info:hover::before {
  opacity: 0.1;
}

.user-info:hover {
  background: rgba(102, 126, 234, 0.05);
}

.user-info span {
  font-weight: 500;
  position: relative;
  z-index: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info :deep(.el-avatar) {
  border: 2px solid var(--border-light);
  transition: var(--transition-base);
  position: relative;
  z-index: 1;
}

.user-info:hover :deep(.el-avatar) {
  border-color: var(--primary-color);
  transform: scale(1.1);
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    height: 64px;
    gap: 10px;
  }
  
  .logo-img {
    height: 32px;
  }
  
  .header-menu {
    display: none;
  }
  
  .header-right :deep(.el-button span) {
    display: none;
  }
}

@media (max-width: 1024px) {
  .header-content {
    padding: 0 20px;
    gap: 12px;
  }

  .header-menu {
    margin: 0;
  }

  .logo-img {
    height: 34px;
  }

  .user-info {
    max-width: 160px;
  }
}
</style>

