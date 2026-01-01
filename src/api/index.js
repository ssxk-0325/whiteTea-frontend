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
      // 检查是否是token过期或无效的错误
      const message = res.message || '请求失败'
      if (isTokenExpiredError(message)) {
        handleTokenExpired()
        return Promise.reject(new Error(message))
      }
      ElMessage.error(message)
      return Promise.reject(new Error(message))
    }
  },
  error => {
    console.error('响应错误:', error)
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.data?.message || '请求失败'
      
      // 处理401未授权或token过期
      if (status === 401 || isTokenExpiredError(message)) {
        handleTokenExpired()
      } else {
        ElMessage.error(message)
      }
    } else {
      // 网络错误或其他错误
      const errorMessage = error.message || '网络错误，请稍后重试'
      if (isTokenExpiredError(errorMessage)) {
        handleTokenExpired()
      } else {
        ElMessage.error(errorMessage)
      }
    }
    return Promise.reject(error)
  }
)

// 判断是否是token过期或无效的错误
function isTokenExpiredError(message) {
  if (!message) return false
  const msg = message.toLowerCase()
  return msg.includes('过期') || 
         msg.includes('expired') || 
         msg.includes('token') && (msg.includes('无效') || msg.includes('invalid') || msg.includes('失效')) ||
         msg.includes('未登录') ||
         msg.includes('unauthorized')
}

// 处理token过期
function handleTokenExpired() {
  // 清除用户信息
  store.dispatch('user/logout')
  // 跳转到登录页，并保存当前路径以便登录后返回
  const currentPath = router.currentRoute.value.fullPath
  if (currentPath !== '/login' && currentPath !== '/register') {
    router.push({
      path: '/login',
      query: { redirect: currentPath }
    })
  } else {
    router.push('/login')
  }
  ElMessage.error('登录已过期，请重新登录')
}

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
  // 订单相关
  order: {
    create: (orderData) => {
      return service.post('/order/create', orderData)
    },
    getById: (id) => {
      return service.get(`/order/${id}`)
    },
    getList: (status) => {
      const params = status !== undefined ? { status } : {}
      return service.get('/order/list', { params })
    },
    pay: (id, payType) => {
      return service.post(`/order/${id}/pay`, { payType })
    },
    confirmReceive: (id) => {
      return service.post(`/order/${id}/confirm`)
    },
    cancel: (id) => {
      return service.post(`/order/${id}/cancel`)
    },
    // 管理后台接口
    admin: {
      getList: (status) => {
        const params = status !== undefined ? { status } : {}
        return service.get('/order/admin/list', { params })
      },
      ship: (id) => {
        return service.post(`/order/admin/${id}/ship`)
      }
    }
  },
  // 地址相关
  address: {
    add: (address) => {
      return service.post('/address/add', address)
    },
    getList: () => {
      return service.get('/address/list')
    },
    update: (address) => {
      return service.put('/address/update', address)
    },
    delete: (id) => {
      return service.delete(`/address/${id}`)
    },
    setDefault: (id) => {
      return service.post(`/address/${id}/set-default`)
    }
  },
  // 社区相关
  community: {
    // 帖子相关
    createPost: (postData) => {
      return service.post('/community/post/create', postData)
    },
    getPostList: (params) => {
      return service.get('/community/post/list', { params })
    },
    getPostDetail: (id) => {
      return service.get(`/community/post/${id}`)
    },
    deletePost: (id) => {
      return service.delete(`/community/post/${id}`)
    },
    likePost: (id) => {
      return service.post(`/community/post/${id}/like`)
    },
    unlikePost: (id) => {
      return service.delete(`/community/post/${id}/like`)
    },
    dislikePost: (id) => {
      return service.post(`/community/post/${id}/dislike`)
    },
    undislikePost: (id) => {
      return service.delete(`/community/post/${id}/dislike`)
    },
    favoritePost: (id) => {
      return service.post(`/community/post/${id}/favorite`)
    },
    unfavoritePost: (id) => {
      return service.delete(`/community/post/${id}/favorite`)
    },
    getUserFavorites: (params) => {
      return service.get('/community/post/favorites', { params })
    },
    // 评论相关
    addComment: (commentData) => {
      return service.post('/community/comment/add', commentData)
    },
    getCommentList: (postId) => {
      return service.get(`/community/comment/list/${postId}`)
    },
    deleteComment: (id) => {
      return service.delete(`/community/comment/${id}`)
    }
  },
  // 文化内容相关
  culture: {
    getList: (params) => {
      return service.get('/culture/list', { params })
    },
    getById: (id) => {
      return service.get(`/culture/${id}`)
    },
    like: (id) => {
      return service.post(`/culture/${id}/like`)
    },
    unlike: (id) => {
      return service.delete(`/culture/${id}/like`)
    },
    getHot: (params) => {
      return service.get('/culture/hot', { params })
    },
    // 管理员接口
    admin: {
      getList: (params) => {
        return service.get('/culture/admin/list', { params })
      },
      create: (data) => {
        return service.post('/culture/admin/create', data)
      },
      update: (data) => {
        return service.put('/culture/admin/update', data)
      },
      delete: (id) => {
        return service.delete(`/culture/admin/${id}`)
      }
    }
  },
  // 活动相关
  activity: {
    getList: (params) => {
      return service.get('/activity/list', { params })
    },
    getById: (id) => {
      return service.get(`/activity/${id}`)
    },
    grabCoupon: (id) => {
      return service.post(`/activity/${id}/grab`)
    },
    checkGrabbed: (id) => {
      return service.get(`/activity/${id}/check-grabbed`)
    },
    getMyCoupons: (params) => {
      return service.get('/activity/coupons', { params })
    },
    // 管理员接口
    admin: {
      getList: (params) => {
        return service.get('/activity/admin/list', { params })
      },
      create: (data) => {
        return service.post('/activity/admin/create', data)
      },
      update: (data) => {
        return service.put('/activity/admin/update', data)
      },
      delete: (id) => {
        return service.delete(`/activity/admin/${id}`)
      }
    }
  },
  // 文件上传
  upload: {
    image: (file) => {
      const formData = new FormData()
      formData.append('file', file)
      return service.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    video: (file) => {
      const formData = new FormData()
      formData.append('file', file)
      return service.post('/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
  },
  // 管理后台相关
  admin: {
    getStats: () => {
      return service.get('/admin/stats')
    }
  },
  // 趣味问答相关
  quiz: {
    getList: (params) => {
      return service.get('/quiz/list', { params })
    },
    getById: (id) => {
      return service.get(`/quiz/${id}`)
    },
    submitAnswer: (id, userAnswer) => {
      return service.post(`/quiz/${id}/answer`, { userAnswer })
    },
    getMyAnswers: (params) => {
      return service.get('/quiz/my-answers', { params })
    },
    getMyStatistics: () => {
      return service.get('/quiz/my-statistics')
    },
    // 管理员接口
    admin: {
      getList: (params) => {
        return service.get('/quiz/admin/list', { params })
      },
      create: (data) => {
        return service.post('/quiz/admin/create', data)
      },
      update: (data) => {
        return service.put('/quiz/admin/update', data)
      },
      delete: (id) => {
        return service.delete(`/quiz/admin/${id}`)
      }
    }
  }
}

export default api

