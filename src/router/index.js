import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/Products.vue'),
    meta: { title: '产品列表' }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetail.vue'),
    meta: { title: '产品详情' }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue'),
    meta: { title: '购物车', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue'),
    meta: { title: '结算', requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/Orders.vue'),
    meta: { title: '个人订单', requiresAuth: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('../views/OrderDetail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },
  {
    path: '/culture',
    name: 'Culture',
    component: () => import('../views/Culture.vue'),
    meta: { title: '福鼎白茶文化' }
  },
  {
    path: '/services/industry',
    name: 'IndustryServices',
    component: () => import('../views/IndustryServices.vue'),
    meta: { title: '产业服务' }
  },
  {
    path: '/activity',
    name: 'Activity',
    component: () => import('../views/Activity.vue'),
    meta: { title: '活动' }
  },
  {
    path: '/activity/:id',
    name: 'ActivityDetail',
    component: () => import('../views/ActivityDetail.vue'),
    meta: { title: '活动详情' }
  },
  {
    path: '/activity/coupons',
    name: 'MyCoupons',
    component: () => import('../views/MyCoupons.vue'),
    meta: { title: '个人券包', requiresAuth: true }
  },
  {
    path: '/culture/article/:id',
    name: 'CultureArticle',
    component: () => import('../views/CultureArticle.vue'),
    meta: { title: '文章详情' }
  },
  {
    path: '/culture/video/:id',
    name: 'CultureVideo',
    component: () => import('../views/CultureVideo.vue'),
    meta: { title: '视频详情' }
  },
  {
    path: '/quiz',
    name: 'Quiz',
    component: () => import('../views/Quiz.vue'),
    meta: { title: '趣味问答' }
  },
  {
    path: '/quiz/:id',
    name: 'QuizDetail',
    component: () => import('../views/QuizDetail.vue'),
    meta: { title: '答题', requiresAuth: true }
  },
  {
    path: '/rewards',
    name: 'Rewards',
    component: () => import('../views/Rewards.vue'),
    meta: { title: '积分商城' }
  },
  {
    path: '/rewards/exchanges',
    name: 'RewardExchanges',
    component: () => import('../views/RewardExchanges.vue'),
    meta: { title: '兑换记录', requiresAuth: true }
  },
  {
    path: '/rewards/:id',
    name: 'RewardDetail',
    component: () => import('../views/RewardDetail.vue'),
    meta: { title: '奖品详情' }
  },
  {
    path: '/customer-service',
    name: 'CustomerService',
    component: () => import('../views/CustomerService.vue'),
    meta: { title: '智能客服', requiresAuth: true }
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('../views/Community.vue'),
    meta: { title: '社区' }
  },
  {
    path: '/community/post/:id',
    name: 'PostDetail',
    component: () => import('../views/PostDetail.vue'),
    meta: { title: '帖子详情' }
  },
  {
    path: '/fuding',
    redirect: '/culture'
  },
  {
    path: '/stores',
    name: 'Stores',
    component: () => import('../views/Stores.vue'),
    meta: { title: '门店地图' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/Admin.vue'),
    meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true },
    redirect: '/admin/dashboard',
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { title: '数据统计' }
      },
      {
        path: 'categories',
        redirect: () => ({ path: '/admin/products', query: { tab: 'categories' } })
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('../views/admin/Products.vue'),
        meta: { title: '产品管理' }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/Orders.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'culture',
        name: 'AdminCulture',
        component: () => import('../views/admin/Culture.vue'),
        meta: { title: '福鼎白茶文化管理' }
      },
      {
        path: 'community',
        name: 'AdminCommunity',
        component: () => import('../views/admin/Community.vue'),
        meta: { title: '社区管理' }
      },
      {
        path: 'activities',
        name: 'AdminActivities',
        component: () => import('../views/admin/Activities.vue'),
        meta: { title: '线下体验管理' }
      },
      {
        path: 'industry-applications',
        name: 'IndustryApplications',
        component: () => import('../views/admin/IndustryApplications.vue'),
        meta: { title: '产业服务报名审核' }
      },
      {
        path: 'quiz',
        name: 'AdminQuiz',
        component: () => import('../views/admin/Quiz.vue'),
        meta: { title: '问答管理' }
      },
      {
        path: 'rewards',
        name: 'AdminRewards',
        component: () => import('../views/admin/Rewards.vue'),
        meta: { title: '积分商城管理' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/Users.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'customer-service',
        name: 'AdminCustomerService',
        component: () => import('../views/admin/CustomerServiceManage.vue'),
        meta: { title: '客服会话' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  const title = to.meta.title || (to.name === 'Admin' ? '管理后台' : '福鼎白茶服务平台')
  document.title = `${title} - 福鼎白茶服务平台`
  
  console.log('路由守卫 - 目标路由:', to.path, '需要认证:', to.meta.requiresAuth, '需要管理员:', to.meta.requiresAdmin)
  console.log('当前token:', store.state.user.token ? '存在' : '不存在')
  console.log('用户信息:', store.state.user.userInfo)
  console.log('用户类型:', store.getters['user/userType'])
  
  if (to.meta.requiresAuth) {
    if (store.state.user.token) {
      // 检查管理员权限
      if (to.meta.requiresAdmin) {
        const userType = store.getters['user/userType'] || store.state.user.userInfo?.userType || 0
        console.log('检查管理员权限 - userType:', userType, '需要: 1')
        if (userType !== 1) {
          console.warn('权限不足，跳转到首页')
          next({ name: 'Home' })
          return
        }
      }
      console.log('权限验证通过，允许访问')
      next()
    } else {
      console.log('未登录，跳转到登录页')
      next({ name: 'Login', query: { redirect: to.fullPath } })
    }
  } else {
    next()
  }
})

export default router

