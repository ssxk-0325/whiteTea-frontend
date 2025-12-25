import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store'
import router from '@/router'

// 创建axios实例
const service = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = store.state.user.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200) {
      return res
    } else {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  error => {
    console.error('响应错误:', error)
    if (error.response) {
      if (error.response.status === 401) {
        store.dispatch('user/logout')
        router.push('/login')
        ElMessage.error('登录已过期，请重新登录')
      } else {
        ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请稍后重试')
    }
    return Promise.reject(error)
  }
)

// API接口
const api = {
  // 用户相关
  user: {
    login: (username, password) => {
      return service.post('/user/login', { username, password })
    },
    register: (username, password, phone) => {
      return service.post('/user/register', { username, password, phone })
    },
    getUserInfo: () => {
      return service.get('/user/info')
    },
    updateUser: (user) => {
      return service.put('/user/update', user)
    },
    changePassword: (oldPassword, newPassword) => {
      return service.post('/user/change-password', { oldPassword, newPassword })
    }
  },
  // 产品相关
  product: {
    getList: (params) => {
      return service.get('/product/list', { params })
    },
    getById: (id) => {
      return service.get(`/product/${id}`)
    },
    getHotProducts: (params) => {
      return service.get('/product/hot', { params })
    },
    add: (product) => {
      return service.post('/product/add', product)
    },
    update: (product) => {
      return service.put('/product/update', product)
    },
    delete: (id) => {
      return service.delete(`/product/${id}`)
    }
  },
  // 分类相关
  category: {
    getList: () => {
      return service.get('/category/list')
    },
    getAll: () => {
      return service.get('/category/all')
    },
    getChildren: (parentId) => {
      return service.get(`/category/children/${parentId}`)
    },
    add: (category) => {
      return service.post('/category/add', category)
    },
    update: (category) => {
      return service.put('/category/update', category)
    }
  },
  // 购物车相关
  cart: {
    getList: () => {
      return service.get('/cart/list')
    },
    add: (productId, quantity) => {
      return service.post('/cart/add', { productId, quantity })
    },
    update: (cartId, quantity) => {
      return service.put('/cart/update', { cartId, quantity })
    },
    remove: (id) => {
      return service.delete(`/cart/${id}`)
    },
    clear: () => {
      return service.delete('/cart/clear')
    }
  },
  // 管理后台相关
  admin: {
    getStats: () => {
      return service.get('/admin/stats')
    }
  }
}

export default api

