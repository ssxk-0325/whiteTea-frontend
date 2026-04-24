<template>
  <div class="product-detail-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1400px; margin: 0 auto; padding: 40px 32px;">
        <el-card class="detail-card" v-loading="loading">
          <el-row :gutter="60">
            <el-col :span="12">
              <div class="image-container">
                <el-image 
                  :src="product.image || DEFAULT_PRODUCT_IMAGE" 
                  fit="contain" 
                  class="product-image"
                  :preview-src-list="[product.image || DEFAULT_PRODUCT_IMAGE]"
                />
              </div>
            </el-col>
            <el-col :span="12">
              <div class="product-header">
                <div class="title-row">
                  <h1 class="product-title">{{ product.name }}</h1>
                  <el-button
                    v-if="isLoggedIn"
                    text
                    type="warning"
                    class="fav-btn"
                    @click="toggleFavorite"
                  >
                    <el-icon :size="20"><StarFilled v-if="favorited" /><Star v-else /></el-icon>
                    {{ favorited ? '已收藏' : '收藏' }}
                  </el-button>
                </div>
                <div class="price-section">
                  <span class="current-price">¥{{ product.price }}</span>
                  <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
                </div>
              </div>
              
              <el-divider class="modern-divider" />
              
              <div class="product-info-card">
                <div class="info-item">
                  <span class="info-label">分类</span>
                  <span class="info-value">{{ categoryName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">库存</span>
                  <span class="info-value">
                    {{ product.stock }} 盒
                    <el-tag v-if="product.stock > 0 && product.stock < 10" type="warning" size="small" style="margin-left: 8px;">库存紧张</el-tag>
                    <el-tag v-else-if="product.stock === 0" type="danger" size="small" style="margin-left: 8px;">缺货</el-tag>
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">销量</span>
                  <span class="info-value">{{ product.sales }} 盒</span>
                </div>
                <div class="info-item" v-if="product.origin">
                  <span class="info-label">产地</span>
                  <span class="info-value">{{ product.origin }}</span>
                </div>
                <div class="info-item" v-if="product.year">
                  <span class="info-label">年份</span>
                  <span class="info-value">{{ product.year }}</span>
                </div>
              </div>
              
              <el-divider class="modern-divider" />
              
              <div class="quantity-section">
                <span class="quantity-label">数量：</span>
                <el-input-number 
                  v-model="quantity" 
                  :min="1" 
                  :max="product.stock"
                  :controls-position="'right'"
                  class="quantity-input"
                />
                <span class="quantity-unit">盒</span>
              </div>
              
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  size="large" 
                  @click="addToCart"
                  class="gradient-button"
                  :disabled="!product.stock"
                >
                  加入购物车
                </el-button>
                <el-button 
                  type="danger" 
                  size="large"
                  class="danger-button"
                  @click="buyNow"
                  :disabled="!product.stock"
                >
                  立即购买
                </el-button>
              </div>
              <div class="secondary-actions">
                <el-button size="large" plain @click="contactMerchant">
                  <el-icon style="margin-right: 4px;"><ChatLineRound /></el-icon>
                  下单前联系商家
                </el-button>
              </div>
              
              <el-divider class="modern-divider" />
              
              <div class="reviews-card">
                <h3 class="description-title">买家评价</h3>
                <el-empty v-if="reviews.length === 0" description="暂无评价，完成订单后可评价" />
                <div v-else class="review-list">
                  <div v-for="r in reviews" :key="r.id" class="review-item">
                    <div class="review-head">
                      <el-rate :model-value="r.rating" disabled show-score text-color="#ff9900" />
                      <span class="review-name">{{ r.userNickname || '匿名用户' }}</span>
                      <span class="review-time">{{ formatReviewTime(r.createTime) }}</span>
                    </div>
                    <p class="review-text">{{ r.content || '用户未填写文字评价' }}</p>
                  </div>
                </div>
              </div>

              <div class="description-card">
                <h3 class="description-title">产品描述</h3>
                <div class="description-content" v-html="product.description"></div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { Star, StarFilled, ChatLineRound } from '@element-plus/icons-vue'
import api from '@/api'
import Header from '@/components/Header.vue'
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/assets'

export default {
  name: 'ProductDetail',
  components: {
    Header,
    Star,
    StarFilled,
    ChatLineRound
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const product = ref({})
    const categoryName = ref('')
    const quantity = ref(1)
    const favorited = ref(false)
    const reviews = ref([])

    const isLoggedIn = computed(() => !!store.state.user.token)

    const loadFavoriteStatus = async () => {
      if (!store.state.user.token || !product.value.id) return
      try {
        const res = await api.product.favorite.check(product.value.id)
        favorited.value = !!res.data?.favorited
      } catch (e) {
        /* 忽略 */
      }
    }

    const loadReviews = async () => {
      if (!route.params.id) return
      try {
        const res = await api.product.getReviews(route.params.id, 8)
        reviews.value = res.data || []
      } catch (e) {
        reviews.value = []
      }
    }

    const toggleFavorite = async () => {
      if (!store.state.user.token) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }
      try {
        if (favorited.value) {
          await api.product.favorite.remove(product.value.id)
          favorited.value = false
          ElMessage.success('已取消收藏')
        } else {
          await api.product.favorite.add(product.value.id)
          favorited.value = true
          ElMessage.success('收藏成功')
        }
      } catch (e) {
        ElMessage.error(e.message || '操作失败')
      }
    }

    const contactMerchant = () => {
      if (!store.state.user.token) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }
      router.push({
        path: '/customer-service',
        query: {
          productId: String(product.value.id),
          productName: product.value.name || ''
        }
      })
    }

    const buyNow = async () => {
      if (!store.state.user.token) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }
      if (!product.value.stock) {
        ElMessage.warning('暂时缺货')
        return
      }
      try {
        await store.dispatch('cart/addToCart', {
          productId: product.value.id,
          quantity: quantity.value
        })
        await store.dispatch('cart/getCartList')
        const row = store.state.cart.cartList.find((c) => c.productId === product.value.id)
        if (row) {
          router.push({ path: '/checkout', query: { cartIds: String(row.id) } })
        } else {
          ElMessage.error('购物车数据异常，请重试')
        }
      } catch (e) {
        ElMessage.error(e.message || '操作失败')
      }
    }

    const formatReviewTime = (t) => {
      if (!t) return ''
      return new Date(t).toLocaleString('zh-CN')
    }

    const loadProduct = async () => {
      loading.value = true
      try {
        const res = await api.product.getById(route.params.id)
        product.value = res.data
        if (product.value.categoryId) {
          const categories = await api.category.getList()
          const category = categories.data.find(c => c.id === product.value.categoryId)
          if (category) {
            categoryName.value = category.name
          }
        }
        
        // 记录浏览历史
        if (store.state.user.token) {
          api.browseHistory.record({
            targetType: 2,
            targetId: product.value.id,
            title: product.value.name,
            image: product.value.image || DEFAULT_PRODUCT_IMAGE
          }).catch(err => console.error('记录历史失败', err))
        }
        await loadFavoriteStatus()
        await loadReviews()
      } catch (error) {
        ElMessage.error('加载产品详情失败')
      } finally {
        loading.value = false
      }
    }

    const addToCart = async () => {
      if (!store.state.user.token) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }
      if (!product.value.stock) {
        ElMessage.warning('暂时缺货')
        return
      }
      try {
        await store.dispatch('cart/addToCart', {
          productId: product.value.id,
          quantity: quantity.value
        })
        ElMessage.success('已加入购物车')
      } catch (error) {
        ElMessage.error('加入购物车失败')
      }
    }

    onMounted(() => {
      loadProduct()
    })

    return {
      loading,
      DEFAULT_PRODUCT_IMAGE,
      product,
      categoryName,
      quantity,
      addToCart,
      buyNow,
      contactMerchant,
      favorited,
      toggleFavorite,
      isLoggedIn,
      reviews,
      formatReviewTime
    }
  }
}
</script>

<style scoped>
.product-detail-page {
  min-height: 100vh;
  background: transparent;
}

.detail-card {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.detail-card :deep(.el-card__body) {
  padding: 40px;
}

.image-container {
  position: sticky;
  top: 100px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: var(--bg-secondary);
  padding: 20px;
}

.product-image {
  width: 100%;
  border-radius: var(--radius-base);
  transition: var(--transition-base);
}

.product-image:hover {
  transform: scale(1.02);
}

.product-header {
  margin-bottom: 24px;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.fav-btn {
  flex-shrink: 0;
}

.product-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  line-height: 1.3;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 8px;
}

.current-price {
  font-size: 40px;
  font-weight: 700;
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.original-price {
  font-size: var(--font-size-lg);
  color: var(--text-placeholder);
  text-decoration: line-through;
}

.modern-divider {
  margin: 32px 0;
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border-base), transparent);
}

.product-info-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin: 24px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-lighter);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: var(--text-regular);
  font-size: var(--font-size-base);
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
  font-size: var(--font-size-base);
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 32px 0;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.quantity-label {
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--text-regular);
}

.quantity-input {
  flex: 1;
  max-width: 200px;
}

.quantity-unit {
  color: var(--text-regular);
  font-weight: 500;
}

.quantity-input :deep(.el-input__wrapper) {
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin: 32px 0;
}

.gradient-button {
  flex: 1;
  background: var(--primary-gradient);
  border: none;
  color: white;
  font-weight: 600;
  font-size: var(--font-size-base);
  height: 50px;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  box-shadow: var(--shadow-md);
}

.gradient-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.danger-button {
  flex: 1;
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  border: none;
  color: white;
  font-weight: 600;
  font-size: var(--font-size-base);
  height: 50px;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  box-shadow: var(--shadow-md);
}

.danger-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.secondary-actions {
  margin-bottom: 24px;
}

.secondary-actions .el-button {
  width: 100%;
  max-width: 100%;
}

.reviews-card {
  margin-top: 32px;
  padding: 32px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 16px;
  background: var(--bg-primary);
  border-radius: var(--radius-base);
  border: 1px solid var(--border-lighter);
}

.review-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.review-name {
  font-weight: 600;
  color: var(--text-primary);
}

.review-time {
  font-size: var(--font-size-sm);
  color: var(--text-placeholder);
}

.review-text {
  margin: 0;
  line-height: 1.6;
  color: var(--text-regular);
}

.description-card {
  margin-top: 40px;
  padding: 32px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.description-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text-primary);
  position: relative;
  padding-bottom: 12px;
}

.description-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
}

.description-content {
  line-height: 1.8;
  color: var(--text-regular);
  font-size: var(--font-size-base);
}

.description-content :deep(p) {
  margin-bottom: 16px;
}

.description-content :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-base);
  margin: 16px 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .detail-card :deep(.el-card__body) {
    padding: 20px;
  }
  
  .product-title {
    font-size: var(--font-size-xl);
  }
  
  .current-price {
    font-size: var(--font-size-2xl);
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .image-container {
    position: static;
    margin-bottom: 24px;
  }
}
</style>

